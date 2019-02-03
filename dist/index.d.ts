import { Connection, ConnectionOptions } from "rhea-promise";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions, ServerOptions } from "./lib/util/common";
export declare class RheaRpc {
    private _connection;
    createAmqpClient(connectionOptions?: ConnectionOptions, connection?: Connection): Promise<RheaRpc>;
    createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient>;
    createRpcServer(amqpNode: string, options?: ServerOptions): Promise<RpcServer>;
}
