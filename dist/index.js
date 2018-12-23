"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rhea_promise_1 = require("rhea-promise");
const rpcClient_1 = require("./lib/rpcClient");
const rpcServer_1 = require("./lib/rpcServer");
class RheaRpc {
    constructor() {
        this._connection = null;
    }
    async createAmqpClient(connectionOptions, connection) {
        if (typeof connection !== 'undefined' && connection !== null) {
            this._connection = connection;
        }
        else {
            this._connection = new rhea_promise_1.Connection(connectionOptions);
        }
        if (!this._connection.isOpen()) {
            await this._connection.open();
        }
        return this;
    }
    async createRpcClient(amqpNode, options) {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        let _rpcClient = new rpcClient_1.RpcClient(amqpNode, this._connection, options);
        await _rpcClient.connect();
        return _rpcClient;
    }
    async createRpcServer(amqpNode) {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        let _rpcServer = new rpcServer_1.RpcServer(amqpNode, this._connection);
        await _rpcServer.connect();
        return _rpcServer;
    }
}
exports.RheaRpc = RheaRpc;
//# sourceMappingURL=index.js.map