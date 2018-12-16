export interface MessageOptions {
    timeout: number;
}
export declare enum RpcRequestType {
    Call = "Call",
    Notify = "Notify"
}
export declare enum RpcResponseCode {
    OK = "OK",
    ERROR = "ERROR"
}
export interface ServerFunctionDefinition {
    name: string;
    params?: {
        type: string;
        properties: any;
    };
}
