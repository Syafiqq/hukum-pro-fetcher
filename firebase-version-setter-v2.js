const firebase = require('firebase/app');
require('firebase/database')
const logger = require("./logger");
const path = require('path')

const store = async ({date, orders, laws, token, isDryRun}) => {
    logger.logProcess('Begin', 'save', `version ${token}`, 'to firebase')
    const versionPath = 'versions_new'
    const newPath = `${versionPath}/v2/${token}`

    if (!isDryRun) {
        await firebase.database()
            .ref(`/${newPath}`)
            .set({
                milis: token,
                timestamp: date,
                detail: {
                    law_filenames: laws.map((f) => path.basename(f)),
                    orders: path.basename(orders)
                }
            })
    }

    logger.logProcess('Finish', 'save', `version ${token}`, 'to firebase')
}

module.exports = {
    store,
}