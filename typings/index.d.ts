import { Connection, ConnectionOptions } from "rhea-promise";

export declare interface ServerFunctionDefinition {
    name: string,
    params?: {
        type: string,
        properties: any,
        required?: Array<string>
    }
}

export declare class RpcServer {
    constructor(amqpNode: string, connection: Connection);
    bind(functionDefintion: ServerFunctionDefinition, callback: Function): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

export declare class RpcClient {
    constructor(amqpNode:string, connection: Connection, options?: MessageOptions);
    call(functionName: string, ...args: any): Promise<{}>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

export declare interface MessageOptions {
    timeout: number
}

export declare class RheaRpc {
    createAmqpClient(connectionOptions: ConnectionOptions, connection?: Connection): Promise<RheaRpc>;
    createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient>;
    createRpcServer(amqpNode: string): Promise<RpcServer>;
}
