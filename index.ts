import { Container, Connection, ConnectionOptions, create_container } from "rhea";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions } from "./lib/util/common";

export class RheaRpc {
    private _container: Container | null = null;
    private _connection: Connection | null = null;
    
    public async createAmqpClient(connectionOptions: ConnectionOptions) {
        this._container = create_container();
        this._connection = this._container.connect(connectionOptions);
        return <Promise<RheaRpc>> new Promise((resolve, reject) => {
            try {
                this._connection!.on('connection_open', () => resolve(this));
            } catch(error) {
                reject(error);
            }
        });
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