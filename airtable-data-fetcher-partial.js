let Airtable = require('airtable');
let logger = require('./logger.js');
Airtable.configure({
    endpointUrl: process.env.AIRTABLE_ENDPOINT,
    apiKey: process.env.AIRTABLE_API_KEY
});

let base = Airtable.base(process.env.AIRTABLE_BASE);

let isSufficient = (json, window) => {
    return json.length >= window
}

let getYear = (text) => {
    if (!text) {
        return null
    }

    const res = text.match(/([12][0-9]{3})/)
    return res && res.length > 0 && res[0]
}

let fetch = async ({ id, name, order, start, window, callback }) => {
    logger.logProcess('Begin', 'fetch', name, 'from airtable')
    let result = []
    let total = 0
    try {
        await base(name)
            .select({
                view: 'Grid view',
            })
            .eachPage(
                (records, fetchNextPage) => {
                    try {
                        records.forEach((record) => {
                            let res = {}
                            const fields = record._rawJson.fields
                            res['_id'] = start++
                            res['id'] = record._rawJson['id']
                            res['year'] = getYear(fields['NOMOR'])
                            res['no'] = fields['NOMOR']
                            res['description'] = fields['TENTANG']
                            res['status'] = fields['STATUS'] || '-'
                            res['reference'] = fields['DOWNLOAD'] || null
                            res['category'] = id
                            res['date_created'] = record._rawJson['createdTime']
                            result.push(res)
                            if (!res['year']) {
                                console.error(`Invalid Year at ${res['no']}`)
                            }
                        });
                        if(isSufficient(result, window)) {
                            callback(result).then()
                            total += result.length
                            result = []
                        }
                        fetchNextPage()
                    }
                    catch (e) {
                        console.error(e)
                    }
                }
            )
    } catch (err) {
        console.error(err)
        total = await fetch({ id, name, order, start, window, callback })
    }
    callback(result).then()
    total += result.length
    result = []
    logger.logProcess('Finish', 'fetch', name, 'from airtable')
    return total
}

module.exports = {
    fetch
}