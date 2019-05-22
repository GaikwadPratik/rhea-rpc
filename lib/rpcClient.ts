import { Connection, EventContext, Receiver, Sender, generate_uuid, Message, ReceiverEvents, SenderOptions, ReceiverOptions, SenderEvents } from "rhea-promise";
import { MessageOptions, RpcRequestType, RpcResponseCode, ErrorCodes } from "./util/common";
import { AmqpRpcRequestTimeoutError, AmqpRpcResponseError } from './util/errors';
import { parseNodeAddress } from './util';

interface PendingRequest {
    id: string,
    name: string,
    params: Array<any>,
    type: RpcRequestType
}

export class RpcClient {
    private _connection: Connection;
    private _sender!: Sender;
    private _receiver!: Receiver;
    private _amqpNode: string = '';
    private _requestPendingResponse: {
        [x: string]: {
            timeout: NodeJS.Timeout,
            response: {
                resolve: (value?: {} | PromiseLike<{}> | undefined) => void;
                reject: (reason?: any) => void;
            }
        };
    } = {};
    private _messageOptions: MessageOptions = {
        timeout: 30000
    };
    private _subject = '';
    constructor(amqpNode: string, connection: Connection, options?: MessageOptions) {
        this._amqpNode = amqpNode;
        if (typeof options !== 'undefined' && options !== null) {
            this._messageOptions = options;
        }
        this._connection = connection;
    }

    private async _sendRequest(request: PendingRequest) {
        const _message: Message = {
            to: this._amqpNode,
            reply_to: request.type === RpcRequestType.Call ? this._receiver.address : '',
            body: {
                params: request.params,
                type: request.type,
                method: request.name,
            },
            subject: this._subject,
            message_id: request.id,
            correlation_id: request.id,
            ttl: this._messageOptions.timeout
        }
        if (request.type === RpcRequestType.Call) {
            return new Promise((resolve, reject) => {
                this._requestPendingResponse[request.id] = {
                    timeout: setTimeout(() => {
                        if (this._requestPendingResponse.hasOwnProperty(request.id)) {
                            clearTimeout(this._requestPendingResponse[request.id].timeout);
                            delete this._requestPendingResponse[request.id];
                        }
                        this.disconnect();
                        return reject(new AmqpRpcRequestTimeoutError(`Request timed out while executing: '${request.name}'`));
                    }, this._messageOptions.timeout),
                    response: { resolve, reject }
                }
                this._sender.send(_message);
            });
        } else {
            this._sender.send(_message);
            return;
        }
    }

    private async _processResponse(context: EventContext) {
        if (typeof context === 'undefined' || context === null) {
            throw new AmqpRpcResponseError('Empty response received from RPC server', ErrorCodes.AmqpRpcEmptyResponse);
        }

        if (typeof context.message === 'undefined' || context.message === null) {
            throw new AmqpRpcResponseError('Empty message body received from RPC server', ErrorCodes.AmqpRpcEmptyResponseBody);
        }

        const id = context.message!.correlation_id as string;
        if (typeof this._requestPendingResponse[id] === 'undefined' || this._requestPendingResponse[id] === null) {
            console.log(`No pending response for ${id}`);
            return;
        }
        const callback = this._requestPendingResponse[id].response;
        delete this._requestPendingResponse[id];
        if (typeof callback === 'undefined' || callback === null) {
            console.log(`No callback found for ${id}`);
            return;
        }
        if (context.message!.body.responseCode === RpcResponseCode.OK) {
            return callback.resolve(context.message!.body.responseMessage);
        } else if (context.message!.body.responseCode === RpcResponseCode.ERROR) {
            const _receivedError = typeof context.message.body.responseMessage === 'string' ? JSON.parse(context.message.body.responseMessage) : context.message.body.responseMessage;
            const _err = new Error(_receivedError.message);
            _err.stack = _receivedError.stack;
            if (typeof _receivedError.code !== 'undefined' && _receivedError.code !== null) {
                (_err as any).code = _receivedError.code;
            }
            return callback.reject(_err);
        }
    }

    public async call(functionName: string, params?: any) {
        if (this._receiver.isOpen() && this._sender.isOpen()) {
            return this._sendRequest({ id: generate_uuid(), name: functionName, params, type: RpcRequestType.Call });
        } else {
            throw new Error('Receiver or Sender is not yet open');
        }
    }

    public async notify(functionName: string, params?: any) {
        if (this._sender.isOpen()) {
            await this._sendRequest({ id: generate_uuid(), name: functionName, params, type: RpcRequestType.Notify });
        } else {
            throw new Error('Sender is not open');
        }
    }

    public async connect() {
        const nodeAddress = parseNodeAddress(this._amqpNode);
        this._amqpNode = nodeAddress.address;
        if (nodeAddress.subject.length > 0) {
            this._subject = nodeAddress.subject;
        }
        const _senderOptions: SenderOptions = {
            target: {}
        };
        const _receiverOptions: ReceiverOptions = {
            source: {
                dynamic: true,
                address: nodeAddress.address
            }
        };

        this._sender = await this._connection.createSender(_senderOptions);
        this._receiver = await this._connection.createReceiver(_receiverOptions);
        this._receiver.on(ReceiverEvents.message, this._processResponse.bind(this));
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