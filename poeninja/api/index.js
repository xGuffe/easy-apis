const express = require('express')
const app = express()
const { fetch_poe_users } = require('../src/getpoename')


app.get('/poeninja/:name', (req, res) => {
    const { name } = req.params
    fetch_poe_users().then(data => {
        if (!(name in data)) {
            res.json({'error': `Could not find the user ${name}`})
        }
        res.json({'search': name, 'account': data[name], 'url': `https://poe.ninja/builds/streamers/character/${name}/${data[name]}?type=streamers&i=0`})
    }).catch(err => {
        console.error(err)
        res.status(500).json({'error': 'Failed to fetch POE user'})
    })
})

module.exports = app