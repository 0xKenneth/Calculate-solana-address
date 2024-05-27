const { Worker } = require('worker_threads');
const numThreads = 8;  // 根据服务器CPU核心数调整（Adjust according to the number of server CPU cores）
const suffix = 'Abcd'; // 想要的尾号，字符越多计算越慢（The more characters you want, the slower the calculation will be）
const fs = require('fs');

let totalAttempts = 0;

function saveAddress(address, secretKey, attempts) {
    const data = {
        address,
        secretKey,
        attempts,
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync('found_address.json', JSON.stringify(data, null, 2));
}

for (let i = 0; i < numThreads; i++) {
    const worker = new Worker('./worker.js');
    worker.postMessage(suffix);

    worker.on('message', (message) => {
        if (message.address) {
            console.log(`Found address: ${message.address}`);
            console.log(`Private Key: ${message.secretKey}`);
            console.log(`Total Attempts: ${totalAttempts + message.attempts}`);
            saveAddress(message.address, message.secretKey, totalAttempts + message.attempts);
            process.exit(0);  // 找到地址后自动停止运行并将公私钥以json格式保存到根文件夹内
            //（After finding the address, it automatically stops running and saves the public and private keys in json format to the root folder）
        } else {
            totalAttempts += 10000;
            console.log(`Total Attempts: ${totalAttempts}`);
        }
    });

    worker.on('error', (error) => {
        console.error(error);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
}
