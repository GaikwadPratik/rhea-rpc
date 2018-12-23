export interface MessageOptions {
    timeout: number
}

export enum RpcRequestType {
    Call = 'Call',
    Notify = 'Notify'
}

export enum RpcResponseCode {
    OK = 'OK',
    ERROR = 'ERROR'
}

export interface ServerFunctionDefinition {
    name: string,
    params?: {
        type: string,
        properties: any,
        required?: Array<string>
    }
}

export enum ErrorCodes {
    RequestTimeOut = 'RequestTimeOut',
    EmptyResponse = 'EmptyResponse',
    EmptyResponseBody = 'EmptyResponseBody',
    MissingFunctionDefinition = 'MissingFunctionDefinition',
    MissingFunctionName = 'MissingFunctionName',
    DuplicateFunctionDefinition = 'DuplicateFunctionDefinition',
    ParamsNotObject = 'ParamsNotObject',
    ParamsMissingProperties = 'ParamsMissingProperties',
    UnknownParameter = 'UnknownParameter',
    UnknownFunction = 'UnknownFunction',
    FunctionDefinitionValidationError = 'FunctionDefinitionValidationError'
}