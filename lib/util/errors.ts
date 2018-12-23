import { ErrorCodes } from './common';

export class RequestTimeoutError extends Error {
    public code: string;
    constructor(message?: string) {
        super(message);
        this.code = ErrorCodes.RequestTimeOut;
    }
}

export class RpcResponseError extends Error {
    public code: string;
    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}

export class MissingFunctionDefinitionError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.MissingFunctionDefinition;
    }
}

export class MissingFunctionNameError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.MissingFunctionName;
    }
}

export class DuplicateFunctionDefinitionError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.DuplicateFunctionDefinition;
    }
}

export class ParamsNotObjectError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.ParamsNotObject;
    }
}

export class ParamsMissingPropertiesError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.ParamsMissingProperties;
    }
}

export class UnknowParameterError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.UnknownParameter;
    }
}

export class UnknownFunctionError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.UnknownFunction;
    }
}

export class FunctionDefinitionValidationError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.FunctionDefinitionValidationError;
    }
}