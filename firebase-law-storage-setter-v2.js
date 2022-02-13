const {v4: uuidv4} = require('uuid');
const {bucket} = require('./firebase-initializer.js')
const logger = require('./logger.js')
const fs = require('fs');

const generate = async ({files, date, token}) => {
    let contentBody = {
        code: 200,
        message: "Accepted",
        data: {
            tag: [],
            data: [],
            datatag: [],
            version: [
                {
                    id: 1,
                    timestamp: date
                }
            ]
        }
    }
    let dataBody = []

    const filename = `${token}.json`
    const filePath = `${process.env.STORAGE_LOCATION}/${filename}`
    logger.logProcess('Begin', 'generate', `${filename}`, 'to a file')

    for (const file of files) {
        let raw = fs.readFileSync(file)
        let laws = JSON.parse(raw.toString())
        for (let i = 0; i < laws.length; i++) {
            let law = laws[i]
            law['id'] = law['_id']
            law['category'] = parseInt(law['category'])
            dataBody.push(law)
        }
    }
    contentBody.data.data = dataBody

    fs.writeFileSync(filePath, JSON.stringify(contentBody))

    logger.logProcess('Finish', 'generate', `${filename}`, 'to a file')

    return filePath
}

const store = async ({file, isDryRun}) => {
    const filename = path.basename(file)
    logger.logProcess('Begin', 'upload', `${filename}`, 'to firebase')

    if (!isDryRun) {
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
    }
    logger.logProcess('Finish', 'upload', `${filename}`, 'to firebase')
}

module.exports = {
    generate,
    store,
}
