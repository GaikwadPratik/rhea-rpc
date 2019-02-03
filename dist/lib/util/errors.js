"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class AmqpRpcRequestTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcRequestTimeOut;
    }
}
exports.AmqpRpcRequestTimeoutError = AmqpRpcRequestTimeoutError;
class AmqpRpcResponseError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.AmqpRpcResponseError = AmqpRpcResponseError;
class AmqpRpcMissingFunctionDefinitionError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcMissingFunctionDefinition;
    }
}
exports.AmqpRpcMissingFunctionDefinitionError = AmqpRpcMissingFunctionDefinitionError;
class AmqpRpcMissingFunctionNameError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcMissingFunctionName;
    }
}
exports.AmqpRpcMissingFunctionNameError = AmqpRpcMissingFunctionNameError;
class AmqpRpcDuplicateFunctionDefinitionError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcDuplicateFunctionDefinition;
    }
}
exports.AmqpRpcDuplicateFunctionDefinitionError = AmqpRpcDuplicateFunctionDefinitionError;
class AmqpRpcParamsNotObjectError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcParamsNotObject;
    }
}
exports.AmqpRpcParamsNotObjectError = AmqpRpcParamsNotObjectError;
class AmqpRpcParamsMissingPropertiesError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcParamsMissingProperties;
    }
}
exports.AmqpRpcParamsMissingPropertiesError = AmqpRpcParamsMissingPropertiesError;
class AmqpRpcUnknowParameterError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcUnknownParameter;
    }
}
exports.AmqpRpcUnknowParameterError = AmqpRpcUnknowParameterError;
class AmqpRpcUnknownFunctionError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcUnknownFunction;
    }
}
exports.AmqpRpcUnknownFunctionError = AmqpRpcUnknownFunctionError;
class AmqpRpcFunctionDefinitionValidationError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.AmqpRpcFunctionDefinitionValidationError;
    }
}
exports.AmqpRpcFunctionDefinitionValidationError = AmqpRpcFunctionDefinitionValidationError;
