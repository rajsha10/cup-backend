import { PrivateKey, getEthereumAddress } from '@injectivelabs/sdk-ts';

const privateKeyHex = "b1e87762ffd962075ef96ef915ec32bac6b47971f26539a460bbe4257df37ee0";
const address = "inj12hwzwusuejawqx2lraq4dsawsk5yvxtgfe0edx";

const pk = PrivateKey.fromHex(privateKeyHex);
const sdkSubaccountId = pk.toAddress().getSubaccountId(0);

const ethAddress = getEthereumAddress(address);
const suffix = "0".toString().padStart(24, '0');
const customSubaccountId = `${ethAddress}${suffix}`;

console.log("SDK subaccountId:   ", sdkSubaccountId);
console.log("Custom subaccountId:", customSubaccountId);
process.exit(0);
