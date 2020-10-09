const fs = require('fs')
const logger = require("./logger");
const limit = 2000000

const generateFilename = (prefix, id, count) => {
    return`${prefix}-${id}-${count}.json`
}

const prepareSaveToFile = (filename, content) => {
    fs.writeFileSync(`${process.env.STORAGE_LOCATION}/${filename}`, content)
}

const save = async (json, prefix, index, { id, name }) => {
    logger.logProcess('Begin', 'save', `${name}-${index}`, 'to a file')
    prepareSaveToFile(generateFilename(prefix, id, index), JSON.stringify(json))
    logger.logProcess('Finish', 'save', `${name}-${index}`, 'to a file')
}

const getSavedFile = async (prefix) => {
    let dirCont = fs.readdirSync( `${process.env.STORAGE_LOCATION}` );
    let regex = new RegExp(`${prefix}.+\.json`);
    return dirCont.filter((text) => {
        return text.match(regex)
    })
        .sort()
        .map((filename) => {
            return `${process.env.STORAGE_LOCATION}/${filename}`
        })
}

module.exports = {
    save,
    getSavedFile
}
