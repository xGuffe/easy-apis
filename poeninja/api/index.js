const express = require('express')
const app = express()
const { fetch_poe_users } = require('../src/getpoename')


app.get('/poeninja/streamers', (req, res) => {
    return fetch_poe_users().then(data => {
        return res.json(data)
    })
})

app.get('/poeninja/streamers/:name', (req, res) => {
    const { name } = req.params
    fetch_poe_users().then(data => {
        if (!(name in data)) {
            return res.json({'error': `Could not find the user ${name}`})
        }
        return res.json({'search': name, 'character': data[name], 'url': `https://poe.ninja/builds/streamers/character/${name}/${data[name]}?type=streamers&i=0`})
    }).catch(err => {
        console.error(err)
        return res.status(500).json({'error': 'Failed to fetch POE user'})
    })
})

module.exports = app