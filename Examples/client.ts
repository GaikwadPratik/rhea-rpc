import { RheaRpc } from "../index";
import { ConnectionOptions } from 'rhea-promise';

async function Main() {
    const _connectionOptions: ConnectionOptions = {
        host: '',
        username: '',
        password: ''
    };
    const _client = await new RheaRpc().createAmqpClient(_connectionOptions);
    const _rpcClient  = await _client.createRpcClient('rpc');
    console.log(await _rpcClient.call('namedParams', { firstName: '123', lastName: '456'}));
    console.log(await _rpcClient.call('simpleParams', '123', '456'));
    console.log(await _rpcClient.call('noParams'));
}

Main()
    .then(() => {
        console.log('Client Connected');
        setTimeout(() => process.exit(0), 1);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });