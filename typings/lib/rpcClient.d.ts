import { Connection } from "rhea";
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
    call(functionName: string, ...args: Array<any>): Promise<{}>;
    connect(): Promise<{}>;
    disconnect(): Promise<void>;
}
