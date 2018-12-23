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
    let _rpcClient  = await _client.createRpcClient('rpc');
    return await _rpcClient.notify('test', 'Pratik');
}

Main()
    .then((c) => {
        console.log('Client Connected');
        console.log(c);
        setTimeout(() => process.exit(0), 1);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });