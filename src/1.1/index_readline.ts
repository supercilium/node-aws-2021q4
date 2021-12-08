import readline from 'readline';
import { reverseString } from './utils.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the input data ', (answer) => {
    console.log(reverseString(answer));

    rl.close();
});