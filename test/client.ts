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
    let _rpcClient  = await _client.createRpcClient('rpc');
    return await _rpcClient.call('test', 'Pratik');
}

Main()
    .then((c) => {
        console.log('Client Connected');
        console.log(c);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });