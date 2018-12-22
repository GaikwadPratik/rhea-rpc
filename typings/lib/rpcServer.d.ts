import { Connection } from "rhea-promise";
import { ServerFunctionDefinition } from "./util/common";
export declare class RpcServer {
    private _connection;
    private _sender;
    private _receiver;
    private _amqpNode;
    private _serverFunctions;
    constructor(amqpNode: string, connection: Connection);
    private _processRequest;
    private _sendResponse;
    /**
     * Extract parameter names from a function
     */
    bind(functionDefintion: ServerFunctionDefinition, callback: Function): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
