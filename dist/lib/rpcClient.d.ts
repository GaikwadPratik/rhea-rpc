import { Connection } from "rhea-promise";
import { MessageOptions } from "./util/common";
export declare class RpcClient {
    private _connection;
    private _sender;
    private _receiver;
    private _amqpNode;
    private _requestPendingResponse;
    private _messageOptions;
    constructor(amqpNode: string, connection: Connection, options?: MessageOptions);
    private _sendRequest;
    private _processResponse;
    call(functionName: string, ...args: any): Promise<{} | undefined>;
    notify(functionName: string, ...args: any): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
