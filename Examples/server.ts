import { RheaRpc } from "../index";
import { ConnectionOptions } from 'rhea-promise';

async function Main() {
    let _client = new RheaRpc();
    let _connectionOptions: ConnectionOptions = {
        host: '',
        username: '',
        password: ''
    };
    _client = await _client.createAmqpClient(_connectionOptions);
    let _rpcServer  = await _client.createRpcServer('rpc');
    _rpcServer.bind({
        name: 'test',
        params: {
            type: 'object',
            properties: {
                args: { 
                    type: 'object',
                    properties: {
                        firstName: { type: 'string' },
                        lastName: { type: 'string' }
                    },
                    required: [ 'firstName', 'lastName' ]
                }
            },
        }
    }, async (args: {firstName: string, lastName: string}) => {
        console.log(`Received input at Server ${JSON.stringify(args)}`);
        return {'Test': `Hi ${args.firstName}`};
    });
}

Main()
    .then(() => console.log('Server Initialized'))
    .catch(err => {
        console.log(err);
        process.exit(1);
    });