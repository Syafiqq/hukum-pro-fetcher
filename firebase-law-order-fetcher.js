const firebase = require('firebase/app');
require('firebase/database')
const lOrderBy = require('lodash/orderBy')
const lFilter = require('lodash/filter')
const logger = require("./logger");
const path = 'law_status_order'

const getOrder = async () => {
    logger.logProcess('Begin', 'load', 'order', 'from firebase')
    let result = (await firebase.database().ref(`/${path}`).once('value')).val()
    let orderedResult = []
    if (result) {
        orderedResult = lOrderBy(result, ['order'], ['asc'])
        orderedResult = lFilter(orderedResult, (o) => { return o })
    }
    logger.logProcess('Finish', 'load', 'order', 'from firebase')
    return orderedResult
}

module.exports = {
    getOrder
}