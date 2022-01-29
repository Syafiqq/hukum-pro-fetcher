let Airtable = require('airtable');
const logger = require("./logger");
Airtable.configure({
    endpointUrl: process.env.AIRTABLE_ENDPOINT,
    apiKey: process.env.AIRTABLE_API_KEY
});

let base = Airtable.base(process.env.AIRTABLE_BASE);
let getYear = (text) => {
    if (!text) {
        return null
    }

    const res = text.match(/([12][0-9]{3})/)
    return res && res.length > 0 && res[0]
}

let fetch = async ({id, name, order}, start, isSample) => {
    logger.logProcess('Begin', 'fetch', name, 'from airtable')
    let result = []
    try {
        let params = {
            view: 'Grid view'
        }
        if (isSample) {
            params['maxRecords'] = 2
        }
        await base(name)
            .select(params)
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
                        fetchNextPage()
                    }
                    catch (e) {
                        console.error(e)
                    }
                }
            )
    } catch (err) {
        console.error(err)
        result = await fetch({ id, name, order}, start)
    }
    logger.logProcess('Finish', 'fetch', name, 'from airtable')
    return result
}

module.exports = {
    fetch
}