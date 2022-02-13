require('dotenv').config()
const firebase = require('firebase/app');
const orderInserter = require('./firebase-law-order-setter.js')
const orderFetcher = require('./firebase-law-order-fetcher.js')
const airtableV2 = require('./airtable-no-categories-fetcher')
const firebaseStorage = require('./firebase-law-storage-setter.js')
const firebaseStorageV2 = require('./firebase-law-storage-setter-v2.js')
const firebaseVersion = require('./firebase-version-setter.js')
const firebaseVersionV2 = require('./firebase-version-setter-v2.js')
const fs = require('fs')
const dateFormat = require('date-fns/format');

let isDryRun = false
let isSample = false
let version = 0

// Fetch Argument
const argv = require('minimist')(process.argv.slice(2));
isDryRun = argv['dry-run'] || isDryRun
isSample = argv['sample'] || isSample
version = Math.min(Math.max(argv['version'] || version, 0), 2)

const fun = async () => {
    console.debug('Begin operating')
    const date = new Date()
    const dateString = dateFormat(date, 'yyyy-MM-dd HH:mm:ss')
    const token = date.getTime()
    const window = 1000000000


    switch (version) {
        case 0: {
            // const dateString = dateFormat(date, 'yyyy-MM-dd HH:mm:ss')
            // await firebaseStorage.storeV0(files, dateString, token, isDryRun)
            // await firebaseVersion.storeV0(dateString, token, isDryRun)
        }
            break
        case 2: {
            const {orders, laws} = await airtableV2.fetch({window, token, isSample})

            const law = await firebaseStorageV2.generate({files: laws, date: dateString, token})

            await firebaseStorageV2.store({law, isDryRun})
            await firebaseVersionV2.store({date, orders, laws, token, isDryRun})

            for (const law of laws) {
                fs.unlinkSync(law)
            }
            fs.unlinkSync(orders)
            fs.unlinkSync(law)
        }
            break
        default:
        // let v1Version = `v${version}`
        // for (const file of files) {
        //     await firebaseStorage.store(file, isDryRun)
        // }
        // await firebaseVersion.store(date, token, v1Version, files, isDryRun)
    }
    console.debug('Finish operating')
    firebase.database().goOffline()
}
fun().then()

