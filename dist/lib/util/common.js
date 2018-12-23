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
    ErrorCodes["RequestTimeOut"] = "RequestTimeOut";
    ErrorCodes["EmptyResponse"] = "EmptyResponse";
    ErrorCodes["EmptyResponseBody"] = "EmptyResponseBody";
    ErrorCodes["MissingFunctionDefinition"] = "MissingFunctionDefinition";
    ErrorCodes["MissingFunctionName"] = "MissingFunctionName";
    ErrorCodes["DuplicateFunctionDefinition"] = "DuplicateFunctionDefinition";
    ErrorCodes["ParamsNotObject"] = "ParamsNotObject";
    ErrorCodes["ParamsMissingProperties"] = "ParamsMissingProperties";
    ErrorCodes["UnknownParameter"] = "UnknownParameter";
    ErrorCodes["UnknownFunction"] = "UnknownFunction";
    ErrorCodes["FunctionDefinitionValidationError"] = "FunctionDefinitionValidationError";
})(ErrorCodes = exports.ErrorCodes || (exports.ErrorCodes = {}));
//# sourceMappingURL=common.js.map