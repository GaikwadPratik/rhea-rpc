"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const rhea_promise_1 = require("rhea-promise");
const common_1 = require("./util/common");
const ajv_1 = tslib_1.__importDefault(require("ajv"));
const errors_1 = require("./util/errors");
class RpcServer {
    constructor(amqpNode, connection, options) {
        this._amqpNode = '';
        this._serverFunctions = {};
        this.STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        this.ARGUMENT_NAMES = /([^\s,]+)/g;
        this._isPlainObject = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        };
        this._amqpNode = amqpNode;
        this._connection = connection;
        this._ajv = new ajv_1.default({
            schemaId: 'auto',
            allErrors: true,
            coerceTypes: false,
            removeAdditional: true,
            ownProperties: true,
            validateSchema: true,
            useDefaults: false
        });
        this._options = options;
    }
    async _processRequest(context) {
        const _reqMessage = context.message;
        if (typeof _reqMessage.subject === 'undefined'
            || _reqMessage.subject === null
            || typeof _reqMessage.body === 'undefined'
            || _reqMessage.body === null) {
            //TODO: Log message is missing subject or body
            context.delivery.release({ undeliverable_here: true });
            return;
        }
        const _replyTo = _reqMessage.reply_to, _correlationId = _reqMessage.correlation_id;
        if (typeof _reqMessage.body === 'string') {
            try {
                _reqMessage.body = JSON.parse(_reqMessage.body);
            }
            catch (error) {
                return await this._sendResponse(_replyTo, _correlationId, error, _replyTo !== '' ? common_1.RpcRequestType.Call : common_1.RpcRequestType.Notify);
            }
        }
        if (typeof this._options !== 'undefined' && this._options !== null && typeof this._options.interceptor === 'function') {
            const proceed = await this._options.interceptor(context.delivery, _reqMessage.body);
            if (proceed === false) {
                return;
            }
        }
        if (typeof this._serverFunctions[_reqMessage.subject] === 'undefined' || this._serverFunctions[_reqMessage.subject] === null) {
            return await this._sendResponse(_replyTo, _correlationId, new errors_1.AmqpRpcUnknownFunctionError(`${_reqMessage.subject} not bound to server`), _reqMessage.body.type);
        }
        const funcCall = this._serverFunctions[_reqMessage.subject];
        let params = _reqMessage.body.args;
        if (Array.isArray(params) && params.length > 0) { // convert to named parameters
            params = funcCall.arguments.reduce(function (obj, p, idx) {
                obj[p] = idx > params.length ? null : params[idx];
                return obj;
            }, {});
        }
        if (typeof funcCall.validate === 'function') {
            const valid = funcCall.validate(params);
            if (!valid) {
                let _err = new errors_1.AmqpRpcFunctionDefinitionValidationError(`Validation Error: ${JSON.stringify(funcCall.validate.errors)}`);
                return await this._sendResponse(_replyTo, _correlationId, _err, _reqMessage.body.type);
            }
        }
        const args = funcCall.arguments.map(function (p) { return params[p]; });
        try {
            const _response = await funcCall.callback.apply(null, args);
            return await this._sendResponse(_replyTo, _correlationId, _response, _reqMessage.body.type);
        }
        catch (error) {
            return await this._sendResponse(_replyTo, _correlationId, error, _reqMessage.body.type);
        }
    }
    async _sendResponse(replyTo, correlationId, msg, type) {
        if (type === common_1.RpcRequestType.Call) {
            let _isError = false;
            if (msg instanceof Error) {
                _isError = true;
                msg = JSON.stringify(msg, Object.getOwnPropertyNames(msg));
            }
            const _resMessage = {
                to: replyTo,
                correlation_id: correlationId,
                body: msg,
                subject: _isError ? common_1.RpcResponseCode.ERROR : common_1.RpcResponseCode.OK
            };
            this._sender.send(_resMessage);
        }
    }
    /**
     * Extract parameter names from a function
     */
    extractParameterNames(func) {
        const fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
        const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
        if (result === null)
            return [];
        return result;
    }
    bind(functionDefintion, callback) {
        if (typeof functionDefintion === 'undefined' || functionDefintion === null) {
            throw new errors_1.AmqpRpcMissingFunctionDefinitionError('Function definition missing');
        }
        if (typeof functionDefintion.name !== 'string') {
            throw new errors_1.AmqpRpcMissingFunctionNameError('Function name is missing from definition');
        }
        if (typeof this._serverFunctions !== 'undefined' && this._serverFunctions !== null && this._serverFunctions.hasOwnProperty(functionDefintion.name)) {
            throw new errors_1.AmqpRpcDuplicateFunctionDefinitionError('Duplicate method being bound to RPC server');
        }
        let _funcDefParams = null, _funcDefinedParams = null, _validate = null;
        if (typeof functionDefintion.params !== 'undefined' && functionDefintion.params !== null) {
            _funcDefParams = functionDefintion.params;
        }
        _funcDefinedParams = this.extractParameterNames(callback);
        if (typeof _funcDefParams !== 'undefined' && _funcDefParams !== null) {
            if (!this._isPlainObject(_funcDefParams)) {
                throw new errors_1.AmqpRpcParamsNotObjectError('not a plain object');
            }
            if (typeof _funcDefParams.properties === 'undefined' || _funcDefParams.properties === null) {
                throw new errors_1.AmqpRpcParamsMissingPropertiesError('missing `properties`');
            }
            // do a basic check to see if we know about all named parameters
            Object.keys(_funcDefParams.properties).map(function (p) {
                const idx = _funcDefinedParams.indexOf(p);
                if (idx === -1)
                    throw new errors_1.AmqpRpcUnknowParameterError(`unknown parameter:  ${p}`);
            });
            _validate = this._ajv.compile(_funcDefParams);
        }
        this._serverFunctions[functionDefintion.name] = {
            callback,
            validate: _validate,
            arguments: _funcDefinedParams
        };
    }
    async connect() {
        const _receiverOptions = {};
        if (typeof this._options !== 'undefined' && this._options !== null && this._options.receiverOptions) {
            Object.assign(_receiverOptions, _receiverOptions, this._options.receiverOptions);
        }
        Object.assign(_receiverOptions, {
            source: {
                address: this._amqpNode
            }
        });
        const _senderOptions = {
            target: {}
        };
        this._receiver = await this._connection.createReceiver(_receiverOptions);
        this._sender = await this._connection.createSender(_senderOptions);
        this._receiver.on(rhea_promise_1.ReceiverEvents.message, this._processRequest.bind(this));
        this._receiver.on(rhea_promise_1.ReceiverEvents.receiverError, (context) => {
            throw context.error;
        });
        this._sender.on(rhea_promise_1.SenderEvents.senderError, (context) => {
            throw context.error;
        });
    }
    async disconnect() {
        await this._sender.close();
        await this._receiver.close();
    }
}
exports.RpcServer = RpcServer;
