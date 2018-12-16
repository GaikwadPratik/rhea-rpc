import { ConnectionOptions } from "rhea";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions } from "./lib/util/common";
export declare class RheaRpc {
    private _container;
    private _connection;
    createAmqpClient(connectionOptions: ConnectionOptions): Promise<RheaRpc>;
    createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient>;
    createRpcServer(amqpNode: string): Promise<RpcServer>;
}
