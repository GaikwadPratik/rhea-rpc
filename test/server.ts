import { RheaRpc } from "../index";
import { ConnectionOptions } from 'rhea';

async function Main() {
    let _client = new RheaRpc();
    let _connectionOptions: ConnectionOptions = {
        host: '192.168.122.4',
        username: 'system',
        password: 'manager'
    };
    _client = await _client.createAmqpClient(_connectionOptions);
    let _rpcServer  = await _client.createRpcServer('rpc');
    _rpcServer.bind({
        name: 'test',
        params: {
            type: 'object',
            properties: {
                arg: { type: 'string' }
            }
        }
    }, async (arg: any) => {
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