const firebase = require('firebase/app');
require('firebase/database')
const lOrderBy = require('lodash/orderBy')
const lFilter = require('lodash/filter')
const orders = require('./law-order.js')
const logger = require("./logger");
const path = 'law_status_order'

const store = async (lawOrders) => {
    let orderedResult = lOrderBy(lawOrders, ['order'], ['asc'])
    orderedResult = lFilter(orderedResult, (o) => { return o })
    await firebase.database()
        .ref(`/${path}`)
        .set(orderedResult)
}

const defaultStore = async () => {
    logger.logProcess('Begin', 'save', 'law order', 'to firebase')
    await store(orders)
    logger.logProcess('Finish', 'save', 'law order', 'to firebase')
}

module.exports = {
    store,
    defaultStore,
}