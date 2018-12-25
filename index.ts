import { Connection, ConnectionOptions } from "rhea-promise";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions, ServerOptions } from "./lib/util/common";

export class RheaRpc {
    private _connection: Connection | null = null;
    
    public async createAmqpClient(connectionOptions?: ConnectionOptions, connection?: Connection): Promise<RheaRpc> {
        if (typeof connection !== 'undefined' && connection !== null) {
            this._connection = connection;
        } else {
            this._connection = new Connection(connectionOptions);
        }
        if (!this._connection.isOpen()) {
            await this._connection.open();
        }
        return this;
    }

    public async createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient> {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        let _rpcClient: RpcClient = new RpcClient(amqpNode, this._connection, options);
        await _rpcClient.connect();
        return _rpcClient;
    }

    public async createRpcServer(amqpNode: string, options?: ServerOptions): Promise<RpcServer> {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        let _rpcServer: RpcServer = new RpcServer(amqpNode, this._connection, options);
        await _rpcServer.connect();
        return _rpcServer;
    }
}