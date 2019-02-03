import { Connection } from "rhea-promise";
import { ServerFunctionDefinition, ServerOptions } from "./util/common";
export declare class RpcServer {
    private _connection;
    private _sender;
    private _receiver;
    private _amqpNode;
    private _serverFunctions;
    private _ajv;
    private readonly STRIP_COMMENTS;
    private readonly ARGUMENT_NAMES;
    private readonly _options;
    constructor(amqpNode: string, connection: Connection, options?: ServerOptions);
    private _processRequest;
    private _sendResponse;
    /**
     * Extract parameter names from a function
     */
    private extractParameterNames;
    private _isPlainObject;
    bind(functionDefintion: ServerFunctionDefinition, callback: Function): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
