A Promise based rpc server and client implementation for `rhea`, using json-schema for validation.

This repo is based on works of [https://github.com/mbroadst/amqp10-rpc.git]. 


TODO
1. Add JSON schema validation(using AJV) for server bound functions when they are called
2. Add documentation in each file
3. Correct type definitions and export defaults for this library
4. Add more test cases with exchange and topic
5. Configure options in `tsconfig.json`
6. Add a generic promise based listener for topics and queues
7. Return custom error object with codes
8. Add null check on all the properties before utilizing