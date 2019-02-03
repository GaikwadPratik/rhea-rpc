export declare class AmqpRpcRequestTimeoutError extends Error {
    code: string;
    constructor(message?: string);
}
export declare class AmqpRpcResponseError extends Error {
    code: string;
    constructor(message: string, code: string);
}
export declare class AmqpRpcMissingFunctionDefinitionError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcMissingFunctionNameError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcDuplicateFunctionDefinitionError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcParamsNotObjectError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcParamsMissingPropertiesError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcUnknowParameterError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcUnknownFunctionError extends Error {
    code: string;
    constructor(message: string);
}
export declare class AmqpRpcFunctionDefinitionValidationError extends Error {
    code: string;
    constructor(message: string);
}
