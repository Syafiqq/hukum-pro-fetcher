const firebase = require('firebase/app');
const dateFormat = require('date-fns/format');
require('firebase/database')
const logger = require("./logger");
const versionPath = 'versions_new'
const path = require('path')

const store = async (date, token, version, files, isDryRun) => {
    logger.logProcess('Begin', 'save', 'version', 'to firebase')
    const versionDate = dateFormat(date, 'yyyy-MM-dd HH:mm:ss')
    const newPath = `${versionPath}/${version}/${token}`

    if (!isDryRun) {
        await firebase.database()
            .ref(`/${newPath}`)
            .set({
                milis: token,
                timestamp: versionDate,
                detail: {
                    filenames: files.map((f) => path.basename(f))
                }
            })
    }

    logger.logProcess('Finish', 'save', 'version', 'to firebase')
    firebase.database().goOffline()
}

module.exports = {
    store,
}