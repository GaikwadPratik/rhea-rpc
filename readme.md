A Promise based rpc server and client implementation for [rhea-promise](https://github.com/amqp/rhea-promise), using json-schema for validation.

This repo is replacement for [amqp10-rpc](https://github.com/mbroadst/amqp10-rpc.git) for `rhea` and `rhea-promise`. 


TODO
- [x] Add JSON schema validation(using AJV) for server bound functions when they are called
- [ ] Add documentation in each file
- [x] Correct type definitions and export defaults for this library
- [ ] Configure options in `tsconfig.json`
- [x] Return custom error object with codes
- [ ] Add null check on all the properties before utilizing
- [ ] Add logging
- [x] Add `notify` in `RpcClient`
- [x] Add support for subject based queue in the form of `queuename/subject`