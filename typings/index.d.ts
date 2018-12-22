import { Connection, ConnectionOptions } from "rhea-promise";
import { RpcClient } from "./lib/rpcClient";
import { RpcServer } from "./lib/rpcServer";
import { MessageOptions } from "./lib/util/common";
export declare class RheaRpc {
    readonly Connection: Connection;
    createAmqpClient(connectionOptions: ConnectionOptions): Promise<RheaRpc>;
    createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient>;
    createRpcServer(amqpNode: string): Promise<RpcServer>;
}
