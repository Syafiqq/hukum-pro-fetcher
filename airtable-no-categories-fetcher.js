let Airtable = require('airtable');
let logger = require('./logger.js');
const fs = require("fs");

const kTableName = 'Peraturan'
const kViewName = 'UU dan peraturan setingkat'

Airtable.configure({
    endpointUrl: process.env.AIRTABLE_ENDPOINT, apiKey: process.env.AIRTABLE_API_KEY
});

let base = Airtable.base(process.env.AIRTABLE_BASE);

let extractNomor = (nomor) => {
    if (!nomor) {
        throw `Nomor is empty: (${nomor})`;
    }

    const result = nomor.match(/([a-zA-Z0-9 .]+) No. [0-9]+ Tahun ([12][0-9]{3})/)
    if (result.length !== 3) {
        throw `Failed to parse NOMOR : (${nomor})`;
    }
    return {category: result[1], year: parseInt(result[2])}
}

let createOrder = (id, name) => {
    return {
        id: `${id}`,
        order: parseInt(id),
        name: name
    }
}

let saveToFile = ({ content, prefix, index }) => {
    const filename = `${prefix}-${index}.json`
    fs.writeFileSync(`${process.env.STORAGE_LOCATION}/${filename}`, JSON.stringify(content))
}

let fetch = async ({token, window, isSample}) => {
    let orders = []
    let ordersMapper = {}
    let table = kTableName
    let results = []
    let index = 0
    let total = 0
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
                for (let i = 0; i < records.length; i++){
                    const record = records[i];

                    try {
                        // Extract Airtable
                        const fields = record._rawJson.fields

                        // Increment Index
                        const id = index++

                        // Extract No
                        let {category, year} = extractNomor(fields['NOMOR'])

                        // Register Category
                        if (!ordersMapper[category]) {
                            let newOrder = createOrder(orders.length + 1, category)
                            orders.push(newOrder)
                            ordersMapper[category] = newOrder
                        }

                        // Get category
                        let categoryId = ordersMapper[category]['id']

                        // Build the result
                        let result = {}
                        result['_id'] = id
                        result['id'] = record._rawJson['id']
                        result['year'] = year
                        result['no'] = fields['NOMOR'] || '-'
                        result['description'] = fields['TENTANG'] || '-'
                        result['status'] = fields['STATUS'] || '-'
                        result['reference'] = fields['DOWNLOAD'] || fields['DOWNLOAD ALTERNATIF'] || null
                        result['category'] = categoryId
                        result['date_created'] = record._rawJson['createdTime']
                        results.push(result)

                        // Save is exceed window
                        if (results.length >= window) {
                            saveToFile({
                                content: results, prefix: token, index: page
                            })

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
        saveToFile({
            content: results, prefix: token, index: page
        })

        results = []
        page = ++page
    }

    logger.logProcess('Finish', 'fetch', table, 'from airtable')
    return total
}

module.exports = {
    fetch
}