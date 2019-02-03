import { Delivery, ReceiverOptions } from 'rhea-promise';
export interface MessageOptions {
    timeout: number;
}
export interface ServerOptions {
    interceptor?(delivery: Delivery, requestMessage: any): boolean;
    receiverOptions?: ReceiverOptions;
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
        required?: Array<string>;
    };
}
export declare enum ErrorCodes {
    AmqpRpcRequestTimeOut = "AmqpRpcRequestTimeOut",
    AmqpRpcEmptyResponse = "AmqpRpcEmptyResponse",
    AmqpRpcEmptyResponseBody = "AmqpRpcEmptyResponseBody",
    AmqpRpcMissingFunctionDefinition = "AmqpRpcMissingFunctionDefinition",
    AmqpRpcMissingFunctionName = "AmqpRpcMissingFunctionName",
    AmqpRpcDuplicateFunctionDefinition = "AmqpRpcDuplicateFunctionDefinition",
    AmqpRpcParamsNotObject = "AmqpRpcParamsNotObject",
    AmqpRpcParamsMissingProperties = "AmqpRpcParamsMissingProperties",
    AmqpRpcUnknownParameter = "AmqpRpcUnknownParameter",
    AmqpRpcUnknownFunction = "AmqpRpcUnknownFunction",
    AmqpRpcFunctionDefinitionValidationError = "AmqpRpcFunctionDefinitionValidationError"
}
