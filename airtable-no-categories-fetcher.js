const Airtable = require('airtable');
const logger = require('./logger.js');
const fs = require("fs");

const kTableName = 'Peraturan'
const kViewName = 'UU dan peraturan setingkat'

Airtable.configure({
    endpointUrl: process.env.AIRTABLE_ENDPOINT, apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE);

const extractNomor = (nomor) => {
    if (!nomor) {
        throw `Nomor is empty: (${nomor})`;
    }

    const result = nomor.match(/([a-zA-Z0-9 .]+) No. [0-9]+ Tahun ([12][0-9]{3})/)
    if (result.length !== 3) {
        throw `Failed to parse NOMOR : (${nomor})`;
    }
    return {category: result[1], year: parseInt(result[2])}
}

const createOrder = (id, name) => {
    return {
        id: `${id}`, order: parseInt(id), name: name
    }
}

const saveLawToFile = ({content, prefix, index}) => {
    const filename = `${prefix}-${index}.json`
    fs.writeFileSync(`${process.env.STORAGE_LOCATION}/${filename}`, JSON.stringify(content))
    return filename
}

const saveOrderToFile = ({content, prefix}) => {
    const filename = `${prefix}-order.json`
    fs.writeFileSync(`${process.env.STORAGE_LOCATION}/${filename}`, JSON.stringify(content))
    return filename
}

const fetch = async ({token, window, isSample}) => {
    let orders = []
    let ordersMapper = {}
    let results = []

    let orderFilenames = []
    let resultFilenames = []

    const table = kTableName
    let index = 0
    let page = 0

    logger.logProcess('Begin', 'fetch', table, 'from airtable')
    try {
        let query = {
            view: kViewName
        }
        if (isSample) {
            query['maxRecords'] = 2
        }
        await base(table)
            .select(query)
            .eachPage((records, fetchNextPage) => {
                for (let i = 0; i < records.length; i++) {
                    const record = records[i];

                    try {
                        // Extract Airtable
                        const fields = record._rawJson.fields

                        // Increment Index
                        const id = ++index

                        // Extract No
                        const {category, year} = extractNomor(fields['NOMOR'])

                        // Register Category
                        if (!ordersMapper[category]) {
                            const newOrder = createOrder(orders.length + 1, category)
                            orders.push(newOrder)
                            ordersMapper[category] = newOrder
                        }

                        // Get category
                        const categoryId = ordersMapper[category]['id']

                        // Build the result
                        let result = {}
                        result['_id'] = id
                        result['id'] = record._rawJson['id']
                        result['year'] = year
                        result['no'] = fields['NOMOR'] || '-'
                        result['description'] = fields['TENTANG'] || '-'
                        result['status'] = fields['STATUS'] || '-'
                        result['reference'] = fields['DOWNLOAD ALTERNATIF'] || fields['DOWNLOAD'] || null
                        result['category'] = categoryId
                        result['date_created'] = record._rawJson['createdTime']
                        results.push(result)

                        // Save if exceed window
                        if (results.length >= window) {
                            const filename = saveLawToFile({
                                content: results, prefix: token, index: page
                            })

                            resultFilenames.push(filename)
                            results = []
                            page = ++page
                        }
                    } catch (e) {
                        console.error(e, 'Skipping')
                    }
                }
                fetchNextPage()
            })
    } catch (err) {
        console.error(err)
    }

    // Save
    if (results.length > 0) {
        const filename = saveLawToFile({
            content: results, prefix: token, index: page
        })
        resultFilenames.push(filename)
    }

    if (orders.length > 0) {
        const filename = saveOrderToFile({
            content: orders, prefix: token
        })
        orderFilenames.push(filename)
    }

    logger.logProcess('Finish', 'fetch', table, 'from airtable')
}

module.exports = {
    fetch
}