import { Connection, ConnectionOptions } from "rhea-promise";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions } from "./lib/util/common";

export class RheaRpc {
    private _connection: Connection | null = null;

    public get Connection(): Connection  {
        return this._connection!;
    }
    
    public async createAmqpClient(connectionOptions: ConnectionOptions): Promise<RheaRpc> {
        this._connection = new Connection(connectionOptions);
        await this._connection.open();
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

    public async createRpcServer(amqpNode: string): Promise<RpcServer> {
        if (this._connection === null) {
            throw new Error(`Please initiate connection using '${this.createAmqpClient.name}'`);
        }
        let _rpcServer: RpcServer = new RpcServer(amqpNode, this._connection);
        await _rpcServer.connect();
        return _rpcServer;
    }
}