import { Connection, EventContext, Receiver, Sender, generate_uuid, Message, ReceiverEvents, SenderOptions, ReceiverOptions, SenderEvents } from "rhea-promise";
import { MessageOptions, RpcRequestType, RpcResponseCode, ErrorCodes } from "./util/common";
import { RequestTimeoutError, RpcResponseError } from './util/Errors';

interface PendingRequest {
    id: string,
    name: string,
    args: Array<any>,
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
    constructor(amqpNode:string, connection: Connection, options?: MessageOptions) {
        this._amqpNode = amqpNode;
        if (typeof options !== 'undefined' && options !== null) {
            this._messageOptions = options;
        }
        this._connection = connection;
    }

    private async _sendRequest(request: PendingRequest) {
        const _message: Message = {
            reply_to: this._receiver.address,
            body: {
                args: request.args,
                type: request.type
            },
            subject: request.name,
            message_id: request.id,
            correlation_id: request.type === RpcRequestType.Call ? request.id : '',
            ttl: this._messageOptions.timeout
        }
        return new Promise((resolve, reject) => {
            if (request.type === RpcRequestType.Call) {
                this._requestPendingResponse[request.id] =  {
                    timeout: setTimeout(() => {
                        if (this._requestPendingResponse.hasOwnProperty(request.id)) {
                            delete this._requestPendingResponse[request.id];
                            throw new RequestTimeoutError();
                        }
                    }, this._messageOptions.timeout),
                    response: {resolve, reject}
                }
            }
            this._sender.send(_message);
        });
    }

    private async _processResponse(context: EventContext) {
        if (typeof context === 'undefined' || context === null) {
            throw new RpcResponseError('Empty response received from RPC server', ErrorCodes.EmptyResponse);
          }
      
          if (typeof context.message === 'undefined' || context.message === null) {
            throw new RpcResponseError('Empty message body received from RPC server', ErrorCodes.EmptyResponseBody);
          }
      
          const id = context.message!.correlation_id as string;
          const callback = this._requestPendingResponse[id].response;
          delete this._requestPendingResponse[id];
          if (typeof callback) {
            if (context.message!.subject === RpcResponseCode.OK) {
              return callback.resolve(context.message!.body);
            } else if (context.message!.subject === RpcResponseCode.ERROR) {
                const _receivedError = typeof context.message.body === 'string' ? JSON.parse(context.message.body) : context.message.body;
                const _err = new Error(_receivedError.message);
                _err.stack = _receivedError.stack;
                if (_receivedError.hasOwnProperty('code')) {
                    (_err as any).code = _receivedError.code;
                }
                return callback.reject(_err);
            }
          } else {
            console.error('no request pending for ' + id + ', ignoring response');
          }
    }

    public async call(functionName: string, ...args: any) {
        if (this._receiver.isOpen() && this._sender.isOpen()) {
            return this._sendRequest({id: generate_uuid(), name: functionName, args, type: RpcRequestType.Call});
        } else {
            throw new Error('Receiver or Sender is not yet open');
        }
    }

    public async connect() {
        const _senderOptions: SenderOptions = {
            target: this._amqpNode
        };
        const _receiverOptions: ReceiverOptions = { 
            source: { 
                dynamic: true, 
                address: this._amqpNode 
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