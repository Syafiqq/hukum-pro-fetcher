const printf = require('printf')

const logProcess = (status, kind, order, origin) => {
    console.log(printf("%-10s %-5s %-30s %s", status, kind, order, origin));
}

module.exports = {
    logProcess
}
