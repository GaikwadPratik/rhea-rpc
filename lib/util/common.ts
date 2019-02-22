import { Delivery, ReceiverOptions } from 'rhea-promise';
export interface MessageOptions {
    timeout: number
}

export interface ServerOptions {
    interceptor?(delivery: Delivery, requestMessage: any): Promise<boolean>,
    receiverOptions?: ReceiverOptions
}

export enum RpcRequestType {
    Obsolete = 'Obsolete', //compatibility with old rpc. will be removed after a year
    Call = 'Call',
    Notify = 'Notify'
}

export enum RpcResponseCode {
    OK = 'OK',
    ERROR = 'ERROR'
}

export interface ServerFunctionDefinition {
    method: string,
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
    AmqpRpcFunctionDefinitionValidationError = 'AmqpRpcFunctionDefinitionValidationError',
    AmqpRpcInvalidNodeAddressError = 'AmqpRpcInvalidNodeAddressError'
}