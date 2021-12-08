import { constants, createReadStream, createWriteStream, WriteStream } from 'fs'
import { access } from 'fs/promises'
import path from 'path'
import csv from 'csvtojson'
import { URL } from 'url'

const __dirname = new URL('./', import.meta.url).pathname

function write(stream: WriteStream, data: string, cb: (value: void | PromiseLike<void>) => void) {
    if (!stream.write(data)) {
        stream.once('drain', cb);
    } else {
        process.nextTick(cb);
    }
}

function onErrorCallback(err: Error) {
    console.error(err)
    process.exit(1)
}
 
process.stdout.write('Enter filename from csv directory (default file1):')
process.stdin.setEncoding('utf-8')
process.stdin.on('data', async (data) => {
    const incoming = data.toString().replace(/\n/g, '') || 'file1'
    const csvPath = path.resolve(__dirname, `csv/${incoming}.csv`)


    access(csvPath, constants.R_OK)
        .then(async () => {
            const readStream = createReadStream(csvPath, {
                encoding: 'utf-8',
            }).on('close', () => console.log('ended reading'))

            const writeStreamJSON = createWriteStream(
                path.resolve(__dirname, `${incoming}-sync.txt`)
            ).on('error', onErrorCallback)

            const writeStreamDB = createWriteStream(
                path.resolve(__dirname, `${incoming}.txt`)
            ).on('error', onErrorCallback)

            await csv()
                .fromStream(readStream)
                .subscribe((json) => {
                    const chunk = JSON.stringify(json) + '\n';
                    write(writeStreamJSON, chunk, () => console.log('simple writing'))

                    return new Promise((resolve, reject) => {

                        setTimeout(() => {
                            write(writeStreamDB, chunk, () => resolve(console.log(json)))
                        }, 1000)
                    })
                },
                    (err) => console.error(err),
                    () => {
                        writeStreamDB.end()
                        writeStreamJSON.end()
                        console.log('finita la comedia')
                    }
                )
            // just ensure all streams are closed
            if (
                writeStreamDB.writableEnded &&
                writeStreamDB.writableFinished &&
                writeStreamJSON.writableEnded &&
                writeStreamJSON.writableFinished
            ) {
                console.log('all streams are finished')
            }

        })
        .catch((err) => {
            console.error('No such file, please try again :(')
            process.exit(1);
        })
        .finally(() => {
            console.log('Successfully written to files')
            process.exit(0);
        })
})
