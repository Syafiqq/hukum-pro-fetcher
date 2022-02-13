require('dotenv').config()
const firebase = require('firebase/app');
const orderInserter = require('./firebase-law-order-setter.js')
const orderFetcher = require('./firebase-law-order-fetcher.js')
const airtable = require('./airtable-data-fetcher-partial.js')
const storageSaver = require('./storage-saver-partial.js')
const firebaseStorage = require('./firebase-law-storage-setter.js')
const firebaseVersion = require('./firebase-version-setter.js')
const fs = require('fs')
const dateFormat = require('date-fns/format');

let isDryRun = false
let isSample = false
let version = 0

// Fetch Argument
const argv = require('minimist')(process.argv.slice(2));
isDryRun = argv['dry-run'] || isDryRun
isSample = argv['sample'] || isSample
version = Math.min(Math.max(argv['version'] || version, 0), 1)

const fun = async () => {
    console.debug('Begin operating')
    const date = new Date()
    const token = date.getTime()
    const window = 1000000000

    const {orders, laws} = await airtable.fetch({window: window, token, isSample})

    console.debug('Finish operating')
    firebase.database().goOffline()
}
fun().then()

