const firebase = require("firebase/app");
const { Storage } = require('@google-cloud/storage');
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)
const gcsConfig = JSON.parse(process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT)

const firebaseApp = firebase.initializeApp(firebaseConfig)
const storage = new Storage({ credentials: gcsConfig })
const bucket = storage.bucket(firebaseConfig.storageBucket)

module.exports = {
    firebaseApp,
    storage,
    bucket,
}