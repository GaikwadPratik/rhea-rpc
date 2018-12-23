"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class RequestTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.RequestTimeOut;
    }
}
exports.RequestTimeoutError = RequestTimeoutError;
class RpcResponseError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.RpcResponseError = RpcResponseError;
class MissingFunctionDefinitionError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.MissingFunctionDefinition;
    }
}
exports.MissingFunctionDefinitionError = MissingFunctionDefinitionError;
class MissingFunctionNameError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.MissingFunctionName;
    }
}
exports.MissingFunctionNameError = MissingFunctionNameError;
class DuplicateFunctionDefinitionError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.DuplicateFunctionDefinition;
    }
}
exports.DuplicateFunctionDefinitionError = DuplicateFunctionDefinitionError;
class ParamsNotObjectError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.ParamsNotObject;
    }
}
exports.ParamsNotObjectError = ParamsNotObjectError;
class ParamsMissingPropertiesError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.ParamsMissingProperties;
    }
}
exports.ParamsMissingPropertiesError = ParamsMissingPropertiesError;
class UnknowParameterError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.UnknownParameter;
    }
}
exports.UnknowParameterError = UnknowParameterError;
class UnknownFunctionError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.UnknownFunction;
    }
}
exports.UnknownFunctionError = UnknownFunctionError;
class FunctionDefinitionValidationError extends Error {
    constructor(message) {
        super(message);
        this.code = common_1.ErrorCodes.FunctionDefinitionValidationError;
    }
}
exports.FunctionDefinitionValidationError = FunctionDefinitionValidationError;
//# sourceMappingURL=errors.js.map