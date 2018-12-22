import { Connection, EventContext, Receiver, Sender, Message, ReceiverOptions, SenderOptions, ReceiverEvents, SenderEvents } from "rhea-promise";
import { RpcRequestType, ServerFunctionDefinition, RpcResponseCode } from "./util/common";
//import Ajv from "ajv";

export class RpcServer {
    private _connection: Connection;
    private _sender!: Sender;
    private _receiver!: Receiver;
    private _amqpNode: string = '';
    private _serverFunctions: {
        [name:string]: Function
    } = {};
    //private _ajv: Ajv.Ajv;
    // private STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    // private ARGUMENT_NAMES = /([^\s,]+)/g;

    constructor(amqpNode: string, connection: Connection) {
        this._amqpNode = amqpNode;
        this._connection = connection;
        // this._ajv = new Ajv({
        //     schemaId: 'auto',
        //     allErrors: true,
        //     coerceTypes: true,
        //     removeAdditional: true,
        //     ownProperties: true
        // });
    }

    private async _processRequest(context: EventContext) {
        let _reqMessage: Message = context.message!;
        if (!_reqMessage.hasOwnProperty('subject') || !_reqMessage.hasOwnProperty('body')) {
            context.delivery!.release({undeliverable_here: true});
            return;
        }
        let _replyTo = _reqMessage.reply_to!,
            _correlationId = _reqMessage.correlation_id!;

        if(typeof _reqMessage.body === 'string') {
            try {
                _reqMessage.body = JSON.parse(_reqMessage.body);
            } catch (error) {
                return await this._sendResponse(_replyTo, _correlationId as string, error, _correlationId !== '' ? RpcRequestType.Call : RpcRequestType.Notify);
            }
        }

        if(!this._serverFunctions.hasOwnProperty(_reqMessage.subject!)) {
            return await this._sendResponse(_replyTo, _correlationId as string, new Error(`${_reqMessage.subject} not bound to server`), _reqMessage.body.type);
        }

        let funcCall = this._serverFunctions[_reqMessage.subject!],
            params = _reqMessage.body.args;
        
        // if (Array.isArray(params)) { // convert to named parameters
        //     params = funcCall.arguments.reduce(function(obj: any, p: any, idx: any) {
        //         obj[p] = idx > params.length ? null : params[idx];
        //         return obj;
        //     }, {});
        // }
        try {
            let _response = await funcCall(params);
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
            let _resMessage: Message = {
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
    // private extractParameterNames(func: Function) {
    //     var fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
    //     var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
    //     if (result === null) return [];
    //     return result;
    // }

    public bind(functionDefintion: ServerFunctionDefinition, callback: Function) {
        if (typeof functionDefintion === 'undefined' || functionDefintion === null) {
            throw new Error('Function definition missing');
        }

        if (!functionDefintion.hasOwnProperty('name')) {
            throw new Error('Function name is missing from definition');
        }

        if (typeof this._serverFunctions !== 'undefined' && this._serverFunctions !== null && this._serverFunctions.hasOwnProperty(functionDefintion.name)) {
            throw new Error('Duplicate method being bound to RPC server');
        }

        if (functionDefintion.hasOwnProperty('params')) {
            
        }

        this._serverFunctions[functionDefintion.name] = callback;
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