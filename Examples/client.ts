import { RheaRpc } from "../index";
import { ConnectionOptions } from 'rhea-promise';

async function Main() {
    const _connectionOptions: ConnectionOptions = {
        host: '',
        username: '',
        password: ''
    };
    const _client = await new RheaRpc().createAmqpClient(_connectionOptions);
    let _rpcClient = await _client.createRpcClient('amq.topic');
    console.log(await _rpcClient.call('namedParams', { firstName: '123', lastName: '456' }));
    _rpcClient = await _client.createRpcClient('amq.topic');
    console.log(await _rpcClient.call('simpleParams', ['123', '456']));
    _rpcClient = await _client.createRpcClient('amq.topic');
    console.log(await _rpcClient.call('noParams'));
    await _client.disconnectClient('amq.topic');

    let _rpcClientWithSubject = await _client.createRpcClient('amq.topic/test');
    console.log(await _rpcClientWithSubject.call('namedParams', { firstName: '123', lastName: '456' }));
    _rpcClientWithSubject = await _client.createRpcClient('amq.topic/test');
    console.log(await _rpcClientWithSubject.call('simpleParams', ['123', '456']));
    _rpcClientWithSubject = await _client.createRpcClient('amq.topic/test');
    console.log(await _rpcClientWithSubject.call('noParams'));
    await _client.disconnectClient('amq.topic/test');
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