import { Connection, ConnectionOptions, Delivery, ReceiverOptions } from "rhea-promise";

export declare interface ServerFunctionDefinition {
    name: string,
    params?: {
        type: string,
        properties: any,
        required?: Array<string>
    }
}

export declare interface ServerOptions {
    interceptor?(delivery: Delivery, requestMessage: any): boolean,
    receiverOptions?: ReceiverOptions
}

export declare class RpcServer {
    constructor(amqpNode: string, connection: Connection);
    bind(functionDefintion: ServerFunctionDefinition, callback: Function, options?: ServerOptions): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

export declare class RpcClient {
    constructor(amqpNode:string, connection: Connection, options?: MessageOptions);
    call(functionName: string, ...args: any): Promise<{}>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    notify(functionName: string, ...args: any): Promise<void>;
}

export declare interface MessageOptions {
    timeout: number
}

export declare class RheaRpc {
    createAmqpClient(connectionOptions?: ConnectionOptions, connection?: Connection): Promise<RheaRpc>;
    createRpcClient(amqpNode: string, options?: MessageOptions): Promise<RpcClient>;
    createRpcServer(amqpNode: string, options?: ServerOptions): Promise<RpcServer>;
}

export declare enum ErrorCodes {
    RequestTimeOut = 'RequestTimeOut',
    EmptyResponse = 'EmptyResponse',
    EmptyResponseBody = 'EmptyResponseBody',
    MissingFunctionDefinition = 'MissingFunctionDefinition',
    MissingFunctionName = 'MissingFunctionName',
    DuplicateFunctionDefinition = 'DuplicateFunctionDefinition',
    ParamsNotObject = 'ParamsNotObject',
    ParamsMissingProperties = 'ParamsMissingProperties',
    UnknownParameter = 'UnknownParameter',
    UnknownFunction = 'UnknownFunction',
    FunctionDefinitionValidationError = 'FunctionDefinitionValidationError'
}