import { reverseString } from "./utils.js"

process.stdin.setEncoding('utf-8')
process.stdin.on('data', (data) => {
    const incoming = data.toString().trim()
    process.stdout.write(reverseString(incoming))
})
