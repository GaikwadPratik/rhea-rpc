import { ErrorCodes } from './common';

export class AmqpRpcRequestTimeoutError extends Error {
    public code: string;
    constructor(message?: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcRequestTimeOut;
    }
}

export class AmqpRpcResponseError extends Error {
    public code: string;
    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}

export class AmqpRpcMissingFunctionDefinitionError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcMissingFunctionDefinition;
    }
}

export class AmqpRpcMissingFunctionNameError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcMissingFunctionName;
    }
}

export class AmqpRpcDuplicateFunctionDefinitionError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcDuplicateFunctionDefinition;
    }
}

export class AmqpRpcParamsNotObjectError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcParamsNotObject;
    }
}

export class AmqpRpcParamsMissingPropertiesError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcParamsMissingProperties;
    }
}

export class AmqpRpcUnknowParameterError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcUnknownParameter;
    }
}

export class AmqpRpcUnknownFunctionError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcUnknownFunction;
    }
}

export class AmqpRpcFunctionDefinitionValidationError extends Error {
    public code: string;
    constructor(message: string) {
        super(message);
        this.code = ErrorCodes.AmqpRpcFunctionDefinitionValidationError;
    }
}