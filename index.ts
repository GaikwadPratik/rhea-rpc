import sourceMapSupport from 'source-map-support'
sourceMapSupport.install({
    handleUncaughtExceptions: false
});
import { Connection, ConnectionOptions, Session } from "rhea-promise";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions, ServerOptions } from "./lib/util/common";
export * from './lib/util/common';

export class RheaRpc {
    private _connection: Connection | null = null;
    private _clientMap = new Map<string, RpcClient>();
    private _serverMap = new Map<string, RpcServer>();
    private _session: Session | null = null;

    public async createAmqpClient(connectionOptions?: ConnectionOptions, connection?: Connection): Promise<RheaRpc> {
        if (typeof connection !== 'undefined' && connection !== null) {
            this._connection = connection;
        } else {
            this._connection = new Connection(connectionOptions);
        }
        if (!this._connection.isOpen()) {
            await this._connection.open();
        }
        this._session = await this._connection.createSession();
        return this;
    }

    public async createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient> {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        if (this._session === null) {
            throw new Error(`Please initiate session using '${this.createAmqpClient.name}'`);
        }
        let _rpcClient: RpcClient;
        if (!this._clientMap.has(amqpNode) || typeof this._clientMap.get(amqpNode) === 'undefined' && this._clientMap.get(amqpNode) === null) {
            _rpcClient = new RpcClient(amqpNode, this._session, options);
            await _rpcClient.connect();
            this._clientMap.set(amqpNode, _rpcClient);
        } else {
            const _originalClient = this._clientMap.get(amqpNode)!;
            _rpcClient = Object.assign(Object.create(Object.getPrototypeOf(_originalClient)), _originalClient);
            if (typeof options !== 'undefined' && options !== null) {
                _rpcClient.ClientOpts = options;
            }
        }
        return _rpcClient;
    }

    public async createRpcServer(amqpNode: string, options?: ServerOptions): Promise<RpcServer> {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        if (this._session === null) {
            throw new Error(`Please initiate session using '${this.createAmqpClient.name}'`);
        }
        let _rpcServer: RpcServer;
        if (!this._serverMap.has(amqpNode) || typeof this._clientMap.get(amqpNode) === 'undefined' || this._clientMap.get(amqpNode) === null) {
            _rpcServer = new RpcServer(amqpNode, this._session, options);
            await _rpcServer.connect();
            this._serverMap.set(amqpNode, _rpcServer);
        } else {
            const _originalServer = this._serverMap.get(amqpNode)!;
            _rpcServer = Object.assign(Object.create(Object.getPrototypeOf(_originalServer)), _originalServer);
            if (typeof options !== 'undefined' && options !== null) {
                _rpcServer.ServerOpts = options;
            }
        }
        return _rpcServer;
    }

    public async closeClient(amqpNode: string) {
        if (this._clientMap.has(amqpNode) && typeof this._clientMap.get(amqpNode) !== 'undefined' && this._clientMap.get(amqpNode) !== null) {
            const _rpcClient = this._clientMap.get(amqpNode)!;
            await _rpcClient.close();
        }
        this._clientMap.delete(amqpNode);
    }

    public async closeServer(amqpNode: string) {
        if (this._serverMap.has(amqpNode) && typeof this._serverMap.get(amqpNode) !== 'undefined' && this._serverMap.get(amqpNode) !== null) {
            const _rpcServer = this._serverMap.get(amqpNode)!;
            await _rpcServer.close();
        }
        this._serverMap.delete(amqpNode);
    }
}