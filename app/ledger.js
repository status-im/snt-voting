import EthereumTx from 'ethereumjs-tx';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import AppEth from '@ledgerhq/hw-app-eth';

const rpcUrl = 'http://127.0.0.1:8545/api'

/**
 * @desc Ledger ETH App instance
 */
export let ledgerInstance = {
  path: "44'/60'/0'/0",
  length: 10,
  accounts: [],
  networkId: null,
  getTransport: () => TransportU2F.create(),
  eth: null,
};

/**
 * @desc init Ledger ETH App instance
 * @param  {String}  [network='mainnet']
 * @return {Object}
 */
export const ledgerInit = async () => {
  const networkId = await web3.eth.net.getId()
  const transport = await ledgerInstance.getTransport();
  const eth = new AppEth(transport);
  ledgerInstance.networkId = networkId;
  ledgerInstance.eth = eth;

  try {
    const pathComponents = getDerivationPathComponents(ledgerInstance.path);
    let accounts = []
    for (let i = 0; i < ledgerInstance.length; i++) {
      const path = `${pathComponents.basePath}${pathComponents.index + i}`;
      const address = await ledgerInstance.eth.getAddress(path);
      address.path = path;
      accounts.push(address);
    }
    ledgerInstance.accounts = accounts;
    web3.eth.getAccounts(console.log)
    return accounts;
  } finally {
    transport.close();
  }
};

export const ledgerSendTransaction = async (toSend, gas, gasPrice) => {
  let txParams = {
    from: window.web3.eth.defaultAccount.toLowerCase(),
    to: toSend._parent.address.toLowerCase(),
    data: toSend.encodeABI(),
    gasPrice: gasPrice,
    gas: gas,
    value: '0x00'
  }
  console.log(txParams)
  const tx = await ledgerSignTransaction(txParams)
  console.log(tx)
  return web3.eth.sendSignedTransaction(tx)
}

/**
 * @desc Ledget ETH App sign transaction
 * @param  {Object}  transaction { tokenObject, from, to, amount, gasPrice }
 * @return {String}
 */
export const ledgerSignTransaction = async transaction => {
  let accounts = ledgerInstance.accounts;
  if (!accounts.length) {
    accounts = await ledgerEthAccounts();
  }
  const account = accounts.filter(
    account => account.address.toLowerCase() === transaction.from.toLowerCase(),
  )[0];
  if (!account) throw new Error("address unknown '" + transaction.from + "'");
  const path = account.path;
  const transport = await ledgerInstance.getTransport();
  try {
    const tx = new EthereumTx(transaction);

    tx.raw[6] = Buffer.from([ledgerInstance.networkId]); // v
    tx.raw[7] = Buffer.from([]); // r
    tx.raw[8] = Buffer.from([]); // s
    const result = await ledgerInstance.eth.signTransaction(
      path,
      tx.serialize().toString('hex'),
    );

    tx.v = Buffer.from(result.v, 'hex');
    tx.r = Buffer.from(result.r, 'hex');
    tx.s = Buffer.from(result.s, 'hex');

    return `0x${tx.serialize().toString('hex')}`;
  } finally {
    transport.close();
  }
};

const getDerivationPathComponents = (derivationPath = '') => {
  const regExp = /^(44'\/6[0|1]'\/\d+'?\/)(\d+)$/;
  const matchResult = regExp.exec(derivationPath);
  if (matchResult === null) {
    throw new Error(
      "To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n ",
    );
  }
  return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
};
