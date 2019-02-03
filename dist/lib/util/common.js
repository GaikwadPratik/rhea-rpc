"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RpcRequestType;
(function (RpcRequestType) {
    RpcRequestType["Call"] = "Call";
    RpcRequestType["Notify"] = "Notify";
})(RpcRequestType = exports.RpcRequestType || (exports.RpcRequestType = {}));
var RpcResponseCode;
(function (RpcResponseCode) {
    RpcResponseCode["OK"] = "OK";
    RpcResponseCode["ERROR"] = "ERROR";
})(RpcResponseCode = exports.RpcResponseCode || (exports.RpcResponseCode = {}));
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes["AmqpRpcRequestTimeOut"] = "AmqpRpcRequestTimeOut";
    ErrorCodes["AmqpRpcEmptyResponse"] = "AmqpRpcEmptyResponse";
    ErrorCodes["AmqpRpcEmptyResponseBody"] = "AmqpRpcEmptyResponseBody";
    ErrorCodes["AmqpRpcMissingFunctionDefinition"] = "AmqpRpcMissingFunctionDefinition";
    ErrorCodes["AmqpRpcMissingFunctionName"] = "AmqpRpcMissingFunctionName";
    ErrorCodes["AmqpRpcDuplicateFunctionDefinition"] = "AmqpRpcDuplicateFunctionDefinition";
    ErrorCodes["AmqpRpcParamsNotObject"] = "AmqpRpcParamsNotObject";
    ErrorCodes["AmqpRpcParamsMissingProperties"] = "AmqpRpcParamsMissingProperties";
    ErrorCodes["AmqpRpcUnknownParameter"] = "AmqpRpcUnknownParameter";
    ErrorCodes["AmqpRpcUnknownFunction"] = "AmqpRpcUnknownFunction";
    ErrorCodes["AmqpRpcFunctionDefinitionValidationError"] = "AmqpRpcFunctionDefinitionValidationError";
})(ErrorCodes = exports.ErrorCodes || (exports.ErrorCodes = {}));
