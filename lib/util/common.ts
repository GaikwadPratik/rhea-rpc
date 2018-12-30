import { Delivery, ReceiverOptions } from 'rhea-promise';
export interface MessageOptions {
    timeout: number
}

export interface ServerOptions {
    interceptor?(delivery: Delivery, requestMessage: any): boolean,
    receiverOptions?: ReceiverOptions
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

export enum ErrorCodes {
    AmqpRpcRequestTimeOut = 'AmqpRpcRequestTimeOut',
    AmqpRpcEmptyResponse = 'AmqpRpcEmptyResponse',
    AmqpRpcEmptyResponseBody = 'AmqpRpcEmptyResponseBody',
    AmqpRpcMissingFunctionDefinition = 'AmqpRpcMissingFunctionDefinition',
    AmqpRpcMissingFunctionName = 'AmqpRpcMissingFunctionName',
    AmqpRpcDuplicateFunctionDefinition = 'AmqpRpcDuplicateFunctionDefinition',
    AmqpRpcParamsNotObject = 'AmqpRpcParamsNotObject',
    AmqpRpcParamsMissingProperties = 'AmqpRpcParamsMissingProperties',
    AmqpRpcUnknownParameter = 'AmqpRpcUnknownParameter',
    AmqpRpcUnknownFunction = 'AmqpRpcUnknownFunction',
    AmqpRpcFunctionDefinitionValidationError = 'AmqpRpcFunctionDefinitionValidationError'
}