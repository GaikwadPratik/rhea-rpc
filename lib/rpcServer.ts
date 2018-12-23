import { Connection, EventContext, Receiver, Sender, Message, ReceiverOptions, SenderOptions, ReceiverEvents, SenderEvents } from "rhea-promise";
import { RpcRequestType, ServerFunctionDefinition, RpcResponseCode } from "./util/common";
import Ajv from "ajv";
import { UnknownFunctionError, FunctionDefinitionValidationError, MissingFunctionDefinitionError, MissingFunctionNameError, DuplicateFunctionDefinitionError, ParamsNotObjectError, ParamsMissingPropertiesError, UnknowParameterError } from './util/errors';

export class RpcServer {
    private _connection: Connection;
    private _sender!: Sender;
    private _receiver!: Receiver;
    private _amqpNode: string = '';
    private _serverFunctions: {
        [name:string]: {
            callback: Function,
            validate: Ajv.ValidateFunction,
            arguments: any
        }
    } = {};
    private _ajv: Ajv.Ajv;
    private readonly STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    private readonly ARGUMENT_NAMES = /([^\s,]+)/g;

    constructor(amqpNode: string, connection: Connection) {
        this._amqpNode = amqpNode;
        this._connection = connection;
        this._ajv = new Ajv({
            schemaId: 'auto',
            allErrors: true,
            coerceTypes: false,
            removeAdditional: true,
            ownProperties: true,
            validateSchema: true,
            useDefaults: false
        });
    }

    private async _processRequest(context: EventContext) {
        const _reqMessage: Message = context.message!;
        if (!_reqMessage.hasOwnProperty('subject') || !_reqMessage.hasOwnProperty('body')) {
            context.delivery!.release({undeliverable_here: true});
            return;
        }
        const _replyTo = _reqMessage.reply_to!,
            _correlationId = _reqMessage.correlation_id!;

        if(typeof _reqMessage.body === 'string') {
            try {
                _reqMessage.body = JSON.parse(_reqMessage.body);
            } catch (error) {
                return await this._sendResponse(_replyTo, _correlationId as string, error, _replyTo !== '' ? RpcRequestType.Call : RpcRequestType.Notify);
            }
        }

        if(!this._serverFunctions.hasOwnProperty(_reqMessage.subject!)) {
            return await this._sendResponse(_replyTo, _correlationId as string, new UnknownFunctionError(`${_reqMessage.subject} not bound to server`), _reqMessage.body.type);
        }

        const funcCall = this._serverFunctions[_reqMessage.subject!];
        let params = _reqMessage.body.args;
        
        if (Array.isArray(params) && params.length > 0) { // convert to named parameters
            params = funcCall.arguments.reduce(function(obj: any, p: any, idx: any) {
                obj[p] = idx > params.length ? null : params[idx];
                return obj;
            }, {});
        }

        if (!!funcCall.validate && typeof funcCall.validate === 'function') {
            const valid = funcCall.validate(params);
            if (!valid) {
                let _err = new FunctionDefinitionValidationError(`Validation Error: ${JSON.stringify(funcCall.validate.errors)}`);
                return await this._sendResponse(_replyTo, _correlationId as string, _err, _reqMessage.body.type);
            }
        }

        const args = funcCall.arguments.map(function(p: any) { return params[p]; });

        try {
            const _response = await funcCall.callback.apply(null, args);
            return await this._sendResponse(_replyTo, _correlationId as string, _response, _reqMessage.body.type);
        } catch (error) {
            return await this._sendResponse(_replyTo, _correlationId as string, error, _reqMessage.body.type);
        }
    }

    private async _sendResponse(replyTo: string, correlationId: string, msg: any, type: RpcRequestType) {
        if (type === RpcRequestType.Call) {
            let _isError = false;
            if (msg instanceof Error) {
                _isError = true;
                msg = JSON.stringify(msg, Object.getOwnPropertyNames(msg))
            }
            const _resMessage: Message = {
                to: replyTo,
                correlation_id: correlationId,
                body: msg,
                subject: _isError ? RpcResponseCode.ERROR : RpcResponseCode.OK
            };
            this._sender.send(_resMessage);
        }
    }

    /**
     * Extract parameter names from a function
     */
    private extractParameterNames(func: Function) {
        const fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
        const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
        if (result === null) return [];
        return result;
    }

    private _isPlainObject = function(obj: any) {
        return Object.prototype.toString.call(obj) === '[object Object]';
      };

    public bind(functionDefintion: ServerFunctionDefinition, callback: Function) {
        if (typeof functionDefintion === 'undefined' || functionDefintion === null) {
            throw new MissingFunctionDefinitionError('Function definition missing');
        }

        if (!functionDefintion.hasOwnProperty('name')) {
            throw new MissingFunctionNameError('Function name is missing from definition');
        }

        if (typeof this._serverFunctions !== 'undefined' && this._serverFunctions !== null && this._serverFunctions.hasOwnProperty(functionDefintion.name)) {
            throw new DuplicateFunctionDefinitionError('Duplicate method being bound to RPC server');
        }

        let _funcDefParams = null,
            _funcDefinedParams: RegExpMatchArray | null = null,
            _validate: Ajv.ValidateFunction | null = null;

        if (functionDefintion.hasOwnProperty('params')) {
            _funcDefParams = functionDefintion.params;
        }

        _funcDefinedParams = this.extractParameterNames(callback);

        if (!!_funcDefParams) {
            if (!this._isPlainObject(_funcDefParams)) {
              throw new ParamsNotObjectError('not a plain object');
            }
        
            if (!_funcDefParams.hasOwnProperty('properties')) {
              throw new ParamsMissingPropertiesError('missing `properties`');
            }
        
            // do a basic check to see if we know about all named parameters
            Object.keys(_funcDefParams.properties).map(function(p) {
              const idx = _funcDefinedParams!.indexOf(p);
              if (idx === -1)
                throw new UnknowParameterError(`unknown parameter:  ${p}`);
            });
        
            _validate = this._ajv.compile(_funcDefParams);
        }
        
        if (this._serverFunctions.hasOwnProperty(functionDefintion.name)) {
            throw new Error(functionDefintion.name);
        }

        this._serverFunctions[functionDefintion.name] = {
            callback,
            validate: _validate!,
            arguments: _funcDefinedParams
        };
    }

    public async connect() {
        const _receiverOptions: ReceiverOptions = {
            source: {
                address: this._amqpNode
            }
        };
        const _senderOptions: SenderOptions = {
            target: {}
        };
        this._receiver = await this._connection.createReceiver(_receiverOptions);;
        this._sender = await this._connection.createSender(_senderOptions);
        this._receiver.on(ReceiverEvents.message, this._processRequest.bind(this));
        this._receiver.on(ReceiverEvents.receiverError, (context: EventContext) => {
            throw context.error;
        });
        this._sender.on(SenderEvents.senderError, (context: EventContext) => {
            throw context.error;
        });
    }

    public async disconnect() {
        await this._sender.close();
        await this._receiver.close();
    }
}