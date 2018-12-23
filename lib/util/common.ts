export interface MessageOptions {
    timeout: number
}

export enum RpcRequestType {
    Call = 'Call',
    Notify = 'Notify'
}

export enum RpcResponseCode {
    OK = 'OK',
    ERROR = 'ERROR'
}

export interface ServerFunctionDefinition {
    name: string,
    params?: {
        type: string,
        properties: any,
        required?: Array<string>
    }
}