const { parentPort } = require('worker_threads');
const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58');

function generateKeypair() {
    return solanaWeb3.Keypair.generate();
}

function checkAddress(address, suffix) {
    return address.endsWith(suffix);
}

parentPort.on('message', (suffix) => {
    let attempts = 0;
    while (true) {
        const keypair = generateKeypair();
        const address = keypair.publicKey.toBase58();

        attempts++;
        if (checkAddress(address, suffix)) {
            parentPort.postMessage({ address, secretKey: bs58.encode(keypair.secretKey), attempts });
            break;
        }

        if (attempts % 10000 === 0) {
            parentPort.postMessage({ attempts });
        }
    }
});
