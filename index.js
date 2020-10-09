require('dotenv').config()
const { firebase } = require('./firebase-initializer.js')
const orderInserter = require('./firebase-law-order-setter.js')
const orderFetcher = require('./firebase-law-order-fetcher.js')
const airtable = require('./airtable-data-fetcher-partial.js')
const storageSaver = require('./storage-saver-partial.js')
const firebaseStorage = require('./firebase-law-storage-setter.js')
const firebaseVersion = require('./firebase-version-setter.js')
const fs = require('fs')

const fun = async () => {
    console.debug('Begin operating')
    let date = new Date()
    let version = 'v1'
    let token = date.getTime()
    let start = 1
    let window = 2000
    await orderInserter.defaultStore()
    const lawOrder = await orderFetcher.getOrder()
    for (const order of lawOrder) {
        let index = 1
        const total = await airtable.fetch({ ...order, start, window, callback: async (result) => {
            await storageSaver.save(result, token, index++, order)
            } }, start)
        start += total
    }
    let files = await storageSaver.getSavedFile(token)
    for (const file of files) {
        await firebaseStorage.store(file)
    }
    await firebaseVersion.store(date, token, version, files)
    for (const file of files) {
        fs.unlinkSync(file)
    }
    console.debug('Finish operating')
}
fun().then()

