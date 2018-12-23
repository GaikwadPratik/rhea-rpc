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
                arg: { type: 'string' }
            },
            required: [ 'arg' ]
        }
    }, async (arg: string) => {
        console.log(`Received input at Server ${arg}`);
        return {'Test': `Hi ${arg}`};
    });
}

Main()
    .then(() => console.log('Server Initialized'))
    .catch(err => {
        console.log(err);
        process.exit(1);
    });