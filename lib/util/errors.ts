import { ErrorCodes } from './common';

export class AmqpRpcResponseError extends Error {
    public code: string;
    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}

export class AmqpRpcRequestTimeoutError extends Error {
    public code: string = ErrorCodes.AmqpRpcRequestTimeOut;
    constructor(message?: string) {
        super(message);
    }
}

export class AmqpRpcMissingFunctionDefinitionError extends Error {
    public code: string = ErrorCodes.AmqpRpcMissingFunctionDefinition;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcMissingFunctionNameError extends Error {
    public code: string = ErrorCodes.AmqpRpcMissingFunctionName;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcDuplicateFunctionDefinitionError extends Error {
    public code: string = ErrorCodes.AmqpRpcDuplicateFunctionDefinition;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcParamsNotObjectError extends Error {
    public code: string = ErrorCodes.AmqpRpcParamsNotObject;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcParamsMissingPropertiesError extends Error {
    public code: string = ErrorCodes.AmqpRpcParamsMissingProperties;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcUnknowParameterError extends Error {
    public code: string = ErrorCodes.AmqpRpcUnknownParameter;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcUnknownFunctionError extends Error {
    public code: string = ErrorCodes.AmqpRpcUnknownFunction;;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcFunctionDefinitionValidationError extends Error {
    public code: string = ErrorCodes.AmqpRpcFunctionDefinitionValidationError;;
    constructor(message: string) {
        super(message);
    }
}

export class AmqpRpcInvalidNodeAddressError extends Error {
    public code: string = ErrorCodes.AmqpRpcInvalidNodeAddressError;
    constructor(message?: string) {
        super(message);
    }
}