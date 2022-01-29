require('dotenv').config()
const firebase = require('firebase/app');
const orderInserter = require('./firebase-law-order-setter.js')
const orderFetcher = require('./firebase-law-order-fetcher.js')
const airtable = require('./airtable-data-fetcher-partial.js')
const storageSaver = require('./storage-saver-partial.js')
const firebaseStorage = require('./firebase-law-storage-setter.js')
const firebaseVersion = require('./firebase-version-setter.js')
const fs = require('fs')

let isDryRun = false
let isSample = false
let version = 0

// Fetch Argument
let argv = require('minimist')(process.argv.slice(2));
isDryRun = argv['dry-run'] || isDryRun
isSample = argv['sample'] || isSample
version = Math.min(Math.max(argv['version'] || version, 0), 1)

const fun = async () => {
    console.debug('Begin operating')
    let date = new Date()
    let token = date.getTime()
    let start = 1
    let window = 2000
    await orderInserter.defaultStore()
    const lawOrder = await orderFetcher.getOrder()
    for (const order of lawOrder) {
        let index = 1
        const total = await airtable.fetch({ ...order, start, window, callback: async (result) => {
            await storageSaver.save(result, token, index++, order)
            }, isSample: isSample }, start)
        start += total
    }
    let files = await storageSaver.getSavedFile(token)
    switch (version) {
        case 0:
            await firebaseVersion.storeV0(date, token, isDryRun)
            break
        default:
            let v1Version = `v${version}`
            for (const file of files) {
                await firebaseStorage.store(file, isDryRun)
            }
            await firebaseVersion.store(date, token, v1Version, files, isDryRun)
    }
    for (const file of files) {
        fs.unlinkSync(file)
    }
    console.debug('Finish operating')
    firebase.database().goOffline()
}
fun().then()

