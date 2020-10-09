const fs = require('fs')
const logger = require("./logger");
const limit = 2000000

const generateFilename = (prefix, id, count) => {
    return`${prefix}-${id}-${count}.json`
}

const prepareSaveToFile = (filename, content) => {
    fs.writeFileSync(`${process.env.STORAGE_LOCATION}/${filename}`, content)
}

const save = async (json, prefix, { id, name }) => {
    logger.logProcess('Begin', 'save', name, 'to a file')
    let start = 0
    let container = ''
    json.forEach((j) => {
        let stringJson = JSON.stringify(j)
        container += stringJson

        if (container.length > limit) {
            prepareSaveToFile(generateFilename(prefix, id, start++), '[' + container + ']')
            container = ''
        } else {
            container += ','
        }
    })
    if (container.charAt(container.length - 1) === ',') {
        container = container.substr(0, container.length - 1)
    }
    prepareSaveToFile(generateFilename(prefix, id, start++), '[' + container + ']')
    logger.logProcess('Finish', 'save', name, 'to a file')
}

module.exports = {
    save
}
