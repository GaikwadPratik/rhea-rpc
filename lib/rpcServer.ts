import { Connection, EventContext, Receiver, Sender, Message, ReceiverOptions, SenderOptions, ReceiverEvents, SenderEvents } from "rhea-promise";
import { RpcRequestType, ServerFunctionDefinition, RpcResponseCode, ServerOptions } from "./util/common";
import Ajv from "ajv";
import { AmqpRpcUnknownFunctionError, AmqpRpcFunctionDefinitionValidationError, AmqpRpcMissingFunctionDefinitionError, AmqpRpcMissingFunctionNameError, 
            AmqpRpcDuplicateFunctionDefinitionError, AmqpRpcParamsNotObjectError, AmqpRpcParamsMissingPropertiesError, AmqpRpcUnknowParameterError 
        } from './util/errors';

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
    private readonly STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
    private readonly ARGUMENT_NAMES = /([^\s,{}]+)/mg;
    private readonly _options!: ServerOptions | undefined;

    constructor(amqpNode: string, connection: Connection, options?: ServerOptions) {
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
        this._options = options;
    }

    private async _processRequest(context: EventContext) {
        if(typeof context.message === 'undefined' || context.message === null) {
            context.delivery!.release({undeliverable_here: true});
            return;
        }
        const _reqMessage: Message = context.message;
        if (typeof _reqMessage.body === 'undefined'
            || _reqMessage.body === null) {
                //TODO: Log message is missing subject or body
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

        //compatibility with old rpc. will be removed after a year
        if(typeof _reqMessage.subject !== 'string') {
            _reqMessage.subject = _reqMessage.body.method;
        }

        //compatibility with old rpc. will be removed after a year
        if (typeof _reqMessage.body.type !== 'string' || !Object.values(RpcRequestType).includes(_reqMessage.body.type)) {
            _reqMessage.body.type = RpcRequestType.Obsolete;
        }

        if (typeof this._options !== 'undefined' && this._options !== null && typeof this._options.interceptor === 'function') {
            const proceed = await this._options.interceptor(context.delivery!, _reqMessage.body);
            if (proceed === false) {
                return;
            }
        }

        if(typeof this._serverFunctions[_reqMessage.subject!] === 'undefined' || this._serverFunctions[_reqMessage.subject!] === null) {
            return await this._sendResponse(_replyTo, _correlationId as string, new AmqpRpcUnknownFunctionError(`${_reqMessage.subject} not bound to server`), _reqMessage.body.type);
        }

        const funcCall = this._serverFunctions[_reqMessage.subject!];
        let params = _reqMessage.body.params,
            overWriteArgs = false;
        
        if (Array.isArray(params) && params.length > 0) {
            if (!this._isPlainObject(params[0])) { // convert to named parameters
                params = funcCall.arguments.reduce(function(obj: any, p: any, idx: any) {
                    obj[p] = idx > params.length ? null : params[idx];
                    return obj;
                }, {});
            } else {
                params = params[0];
                overWriteArgs = true;
            }
        }

        if (typeof funcCall.validate === 'function') {
            const valid = funcCall.validate(params);
            if (!valid) {
                let _err = new AmqpRpcFunctionDefinitionValidationError(`Validation Error: ${JSON.stringify(funcCall.validate.errors)}`);
                return await this._sendResponse(_replyTo, _correlationId as string, _err, _reqMessage.body.type);
            }
        }

        try {
            let _response: any;
            if (!overWriteArgs) {
                const args = funcCall.arguments.map(function(p: any) { return params[p]; });
                _response = await funcCall.callback.apply(null, args);
            } else {
                _response = await funcCall.callback.call(null, params);
            }
            return await this._sendResponse(_replyTo, _correlationId as string, _response, _reqMessage.body.type);
        } catch (error) {
            return await this._sendResponse(_replyTo, _correlationId as string, error, _reqMessage.body.type);
        }
    }

    private async _sendResponse(replyTo: string, correlationId: string, msg: any, type: RpcRequestType) {
        if ([RpcRequestType.Call, RpcRequestType.Obsolete].includes(type)) {
            let _isError = false;
            if (msg instanceof Error) {
                _isError = true;
                //compatibility with old rpc. will be removed after a year
                if (type === RpcRequestType.Obsolete) {
                    msg = {
                        error: {
                            code: typeof (msg as any).code !== 'undefined' && (msg as any).code !== null ? (msg as any).code : 'ErrorWithoutCode',
                            message: typeof msg.message === 'string' ? msg.message : 'ErrorWithoutMessage',
                            data: typeof (msg as any).data !== 'undefined' && (msg as any).data !== null ? (msg as any).data : msg,
                        }
                    }
                } else {
                    msg = JSON.stringify(msg, Object.getOwnPropertyNames(msg))
                }
            } else {
                //compatibility with old rpc. will be removed after a year
                if (type === RpcRequestType.Obsolete) {
                    msg = typeof msg === 'undefined' ? null : { result: msg };
                }
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
            throw new AmqpRpcMissingFunctionDefinitionError('Function definition missing');
        }

        if (typeof functionDefintion.method !== 'string') {
            throw new AmqpRpcMissingFunctionNameError('Function name is missing from definition');
        }

        if (typeof this._serverFunctions !== 'undefined' && this._serverFunctions !== null && this._serverFunctions.hasOwnProperty(functionDefintion.method)) {
            throw new AmqpRpcDuplicateFunctionDefinitionError('Duplicate method being bound to RPC server');
        }

        let _funcDefParams = null,
            _funcDefinedParams: RegExpMatchArray | null = null,
            _validate: Ajv.ValidateFunction | null = null;

        if (typeof functionDefintion.params !== 'undefined' && functionDefintion.params !== null) {
            _funcDefParams = functionDefintion.params;
        }

        _funcDefinedParams = this.extractParameterNames(callback);

        if (typeof _funcDefParams !== 'undefined' && _funcDefParams !== null) {
            if (!this._isPlainObject(_funcDefParams)) {
              throw new AmqpRpcParamsNotObjectError('not a plain object');
            }
        
            if (typeof _funcDefParams.properties === 'undefined' || _funcDefParams.properties === null) {
              throw new AmqpRpcParamsMissingPropertiesError('missing `properties`');
            }
        
            // do a basic check to see if we know about all named parameters
            Object.keys(_funcDefParams.properties).map(function(p) {
              const idx = _funcDefinedParams!.indexOf(p);
              if (idx === -1)
                throw new AmqpRpcUnknowParameterError(`unknown parameter: ${p} in ${functionDefintion.method}`);
            });
        
            _validate = this._ajv.compile(_funcDefParams);
        }

        this._serverFunctions[functionDefintion.method] = {
            callback,
            validate: _validate!,
            arguments: _funcDefinedParams
        };
    }

    public async connect() {
        const _receiverOptions: ReceiverOptions = {};
        if (typeof this._options !== 'undefined' && this._options !== null && this._options.receiverOptions) {
            Object.assign(_receiverOptions, _receiverOptions, this._options.receiverOptions);
        }

        Object.assign(_receiverOptions, {
            source: {
                address: this._amqpNode
            }
        });
        
        const _senderOptions: SenderOptions = {
            target: {}
        };
        this._receiver = await this._connection.createReceiver(_receiverOptions);
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