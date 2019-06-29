import { EventContext, Receiver, generate_uuid, Message, ReceiverEvents, SenderOptionsWithSession, ReceiverOptionsWithSession, Session, SenderEvents, AwaitableSender } from "rhea-promise";
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
    private _sender!: AwaitableSender;
    private _receiver!: Receiver;
    private _session: Session;
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
    private _senderName = `${generate_uuid()}-${this._amqpNode}-sender-client`;
    private _receiverName = `${generate_uuid()}-${this._amqpNode}-receiver-client`;

    constructor(amqpNode: string, session: Session, options?: MessageOptions) {
        this._amqpNode = amqpNode;
        if (typeof options !== 'undefined' && options !== null) {
            this._messageOptions = options;
        }
        this._session = session;
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
            return new Promise(async (resolve, reject) => {
                this._requestPendingResponse[request.id] = {
                    timeout: setTimeout(() => {
                        if (this._requestPendingResponse.hasOwnProperty(request.id)) {
                            clearTimeout(this._requestPendingResponse[request.id].timeout);
                            delete this._requestPendingResponse[request.id];
                        }
                        return reject(new AmqpRpcRequestTimeoutError(`Request timed out while executing: '${request.name}'`));
                    }, this._messageOptions.timeout),
                    response: { resolve, reject }
                }
                try {
                    await this._sender.send(_message);
                } catch (err) {
                    return reject(err);
                }
            });
        } else {
            await this._sender.send(_message);
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
        if (!this._receiver.isOpen()) {
            throw new Error('Receiver is not yet open');
        }
        if (!this._sender.isOpen()) {
            throw new Error('Sender is not yet open');
        }
        return this._sendRequest({ id: generate_uuid(), name: functionName, params, type: RpcRequestType.Call });
    }

    public async notify(functionName: string, params?: any) {
        if (this._sender.isOpen()) {
            await this._sendRequest({ id: generate_uuid(), name: functionName, params, type: RpcRequestType.Notify });
        } else {
            throw new Error('Sender is not open');
        }
    }

    public async connect() {
        this._receiverName = `${this._receiverName}-${this._amqpNode}`;
        this._senderName = `${this._senderName}-${this._amqpNode}`;
        const nodeAddress = parseNodeAddress(this._amqpNode);
        this._amqpNode = nodeAddress.address;
        if (nodeAddress.subject.length > 0) {
            this._subject = nodeAddress.subject;
        }
        const _receiverOptions: ReceiverOptionsWithSession = {
            source: {
                dynamic: true,
                address: nodeAddress.address
            },
            name: this._receiverName,
            onSessionError: (context: EventContext) => {
                const error = context.session && context.session.error;
                (error as any).code = `${this._receiverName}-SessionError`;
                throw error;
            }
        };
        this._receiver = await this._session.createReceiver(_receiverOptions);
        if (!this._receiver.isOpen()) {
            this._receiver = await this._session.createReceiver(_receiverOptions);
        }
        this._receiver.on(ReceiverEvents.receiverError, (context: EventContext) => {
            const error = context.receiver && context.receiver.error;
            (error as any).code = `${this._receiverName}-receiverError`;
            throw error;
        });
        this._receiver.on(ReceiverEvents.message, this._processResponse.bind(this));
        const _senderOptions: SenderOptionsWithSession = {
            target: {},
            name: this._senderName,
            onSessionError: (context: EventContext) => {
                const error = context.session && context.session.error;
                (error as any).code = `${this._senderName}-SessionError`;
                throw error;
            }
        };
        this._sender = await this._session.createAwaitableSender(_senderOptions);
        if (!this._sender.isOpen()) {
            this._sender = await this._session.createAwaitableSender(_senderOptions);
        }
        this._sender.on(SenderEvents.senderError, (context: EventContext) => {
            const error = context.sender && context.sender.error;
            (error as any).code = `${this._senderName}-SenderError`;
            throw error;
        });
    }

    public async close(closeSession = false) {
        if (!this._sender.isClosed()) {
            await this._sender.close({ closeSession });
        }
        if (!this._receiver.isClosed()) {
            await this._receiver.close({ closeSession });
        }
    }
}