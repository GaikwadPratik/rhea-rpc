import { AmqpRpcInvalidNodeAddressError } from './errors';

export function parseNodeAddress(nodeAddress: string) {
    const result = { address: '', subject: ''};
    if (!nodeAddress.includes('/')) {
        result.address = nodeAddress;
        return result;
    } else {
        const tempAddress = nodeAddress.split('/');
        if (tempAddress.length <= 0) {
            throw new AmqpRpcInvalidNodeAddressError(`Invalid address ${nodeAddress}`);
        }
        result.address = tempAddress.shift()!;
        result.subject = tempAddress.shift()!;
        return result;
    }
}