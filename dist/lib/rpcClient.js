"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rhea_promise_1 = require("rhea-promise");
const common_1 = require("./util/common");
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
        let _message = {
            reply_to: this._receiver.address,
            body: {
                args: request.args,
                type: request.type
            },
            subject: request.name,
            message_id: request.id,
            correlation_id: request.type === common_1.RpcRequestType.Call ? request.id : '',
            ttl: this._messageOptions.timeout
        };
        return new Promise((resolve, reject) => {
            if (request.type === common_1.RpcRequestType.Call) {
                this._requestPendingResponse[request.id] = {
                    timeout: setTimeout(() => {
                        if (this._requestPendingResponse.hasOwnProperty(request.id)) {
                            delete this._requestPendingResponse[request.id];
                            throw new Error('Request timed out');
                        }
                    }, this._messageOptions.timeout),
                    response: { resolve, reject }
                };
            }
            this._sender.send(_message);
        });
    }
    async _processResponse(context) {
        if (typeof context === 'undefined' || context === null) {
            throw new Error('Empty response received from RPC server');
        }
        if (typeof context.message === 'undefined' || context.message === null) {
            throw new Error('Empty message body received from RPC server');
        }
        let id = context.message.correlation_id;
        let callback = this._requestPendingResponse[id].response;
        delete this._requestPendingResponse[id];
        if (typeof callback) {
            if (context.message.subject === common_1.RpcResponseCode.OK) {
                return callback.resolve(context.message.body);
            }
            else {
                let _receivedError = JSON.parse(context.message.body);
                let _err = new Error(_receivedError.message);
                _err.stack = _receivedError.stack;
                // if (_receivedError.hasOwnProperty('code')) {
                //     _err["code"] = _receivedError.code;
                // }
                return callback.reject(_err);
            }
        }
        else {
            console.error('no request pending for ' + id + ', ignoring response');
        }
    }
    async call(functionName, ...args) {
        if (this._receiver.isOpen()) {
            return this._sendRequest({ id: rhea_promise_1.generate_uuid(), name: functionName, args, type: common_1.RpcRequestType.Call });
        }
        else {
            throw new Error('Receiver is not yet open');
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