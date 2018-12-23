"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rhea_promise_1 = require("rhea-promise");
const common_1 = require("./util/common");
const errors_1 = require("./util/errors");
class RpcClient {
    constructor(amqpNode, connection, options) {
        this._amqpNode = '';
        this._requestPendingResponse = {};
        this._messageOptions = {
            timeout: 30000
        };
        this._amqpNode = amqpNode;
        if (typeof options !== 'undefined' && options !== null) {
            this._messageOptions = options;
        }
        this._connection = connection;
    }
    async _sendRequest(request) {
        const _message = {
            reply_to: request.type === common_1.RpcRequestType.Call ? this._receiver.address : '',
            body: {
                args: request.args,
                type: request.type
            },
            subject: request.name,
            message_id: request.id,
            correlation_id: request.id,
            ttl: this._messageOptions.timeout
        };
        if (request.type === common_1.RpcRequestType.Call) {
            return new Promise((resolve, reject) => {
                this._requestPendingResponse[request.id] = {
                    timeout: setTimeout(() => {
                        if (this._requestPendingResponse.hasOwnProperty(request.id)) {
                            delete this._requestPendingResponse[request.id];
                        }
                        return reject(new errors_1.RequestTimeoutError(`Request timed out while executing: '${request.name}'`));
                    }, this._messageOptions.timeout),
                    response: { resolve, reject }
                };
                this._sender.send(_message);
            });
        }
        else {
            this._sender.send(_message);
            return;
        }
    }
    async _processResponse(context) {
        if (typeof context === 'undefined' || context === null) {
            throw new errors_1.RpcResponseError('Empty response received from RPC server', common_1.ErrorCodes.EmptyResponse);
        }
        if (typeof context.message === 'undefined' || context.message === null) {
            throw new errors_1.RpcResponseError('Empty message body received from RPC server', common_1.ErrorCodes.EmptyResponseBody);
        }
        const id = context.message.correlation_id;
        const callback = this._requestPendingResponse[id].response;
        delete this._requestPendingResponse[id];
        if (typeof callback) {
            if (context.message.subject === common_1.RpcResponseCode.OK) {
                return callback.resolve(context.message.body);
            }
            else if (context.message.subject === common_1.RpcResponseCode.ERROR) {
                const _receivedError = typeof context.message.body === 'string' ? JSON.parse(context.message.body) : context.message.body;
                const _err = new Error(_receivedError.message);
                _err.stack = _receivedError.stack;
                if (_receivedError.hasOwnProperty('code')) {
                    _err.code = _receivedError.code;
                }
                return callback.reject(_err);
            }
        }
        else {
            console.error('no request pending for ' + id + ', ignoring response');
        }
    }
    async call(functionName, ...args) {
        if (this._receiver.isOpen() && this._sender.isOpen()) {
            return this._sendRequest({ id: rhea_promise_1.generate_uuid(), name: functionName, args, type: common_1.RpcRequestType.Call });
        }
        else {
            throw new Error('Receiver or Sender is not yet open');
        }
    }
    async notify(functionName, ...args) {
        if (this._sender.isOpen()) {
            await this._sendRequest({ id: rhea_promise_1.generate_uuid(), name: functionName, args, type: common_1.RpcRequestType.Notify });
        }
        else {
            throw new Error('Sender is not open');
        }
    }
    async connect() {
        const _senderOptions = {
            target: this._amqpNode
        };
        const _receiverOptions = {
            source: {
                dynamic: true,
                address: this._amqpNode
            }
        };
        this._sender = await this._connection.createSender(_senderOptions);
        this._receiver = await this._connection.createReceiver(_receiverOptions);
        this._receiver.on(rhea_promise_1.ReceiverEvents.message, this._processResponse.bind(this));
        this._receiver.on(rhea_promise_1.ReceiverEvents.receiverError, (context) => {
            throw context.error;
        });
        this._sender.on(rhea_promise_1.SenderEvents.senderError, (context) => {
            throw context.error;
        });
    }
    async disconnect() {
        await this._sender.close();
        await this._receiver.close();
    }
}
exports.RpcClient = RpcClient;
//# sourceMappingURL=rpcClient.js.map