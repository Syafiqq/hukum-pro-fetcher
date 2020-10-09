const { v4: uuidv4 } = require('uuid');
const { bucket } = require('./firebase-initializer.js')
const path = require("path");
const logger = require('./logger.js')

const store = async (file) => {
    const filename = path.basename(file)
    logger.logProcess('Begin', 'upload', `${filename}`, 'to firebase')
    await bucket.upload(file, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        destination: `${process.env.FIREBASE_STORAGE_LOCATION}/${filename}`,
        gzip: true,
        // By setting the option `destination`, you can change the name of the
        // object you are uploading to a bucket.
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            contentType: 'application/json; charset=utf-8',
            metadata: {
                firebaseStorageDownloadTokens: uuidv4(),
            }
        },
        public: true,
        validation: 'md5',
    });
    logger.logProcess('Finish', 'upload', `${filename}`, 'to firebase')
}

module.exports = {
    store,
}
