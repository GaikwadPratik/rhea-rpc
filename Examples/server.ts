import { RheaRpc } from "../index";
import { ConnectionOptions } from 'rhea-promise';
import { RpcServer } from '../lib/rpcServer';

async function bindFunctions(server: RpcServer) {
    server.bind({
        method: 'noParams'
    }, async() => {
        return true;
    })
    server.bind({
        method: 'namedParams',
        params: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' }                
            },
            required: [ 'firstName', 'lastName' ]
        }
    }, async ({firstName, lastName}: {firstName: string, lastName: string}) => {
        console.log(`Received input at Server ${JSON.stringify(firstName)}`);
        return {'Test': `Hi ${lastName}`};
    });
    server.bind({
        method: 'simpleParams',
        params: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' }                
            },
            required: [ 'firstName', 'lastName' ]
        }
    }, async (firstName: string, lastName: string) => {
        console.log(`Received input at Server ${JSON.stringify(firstName)}`);
        return {'Test': `Hi ${lastName}`};
    });
}

async function Main() {
    let _client = new RheaRpc();
    let _connectionOptions: ConnectionOptions = {
        host: '',
        username: '',
        password: ''
    };
    _client = await _client.createAmqpClient(_connectionOptions);
    const _rpcServer  = await _client.createRpcServer('amq.topic');
    await bindFunctions(_rpcServer);
    const _rpcServerWithSubject = await _client.createRpcServer('amq.topic/test');
    await bindFunctions(_rpcServerWithSubject);
}

Main()
    .then(() => console.log('Server Initialized'))
    .catch(err => {
        console.log(err);
        process.exit(1);
    });