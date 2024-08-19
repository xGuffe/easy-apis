const protobuf = require('protobufjs')

// Define the .proto schema directly in code
const protoSchema = `
syntax = "proto3";

message TestMessage {
    message EmbeddedMessage1 {
        repeated bytes tag5 = 5;
    }
    EmbeddedMessage1 tag1 = 1;
}
`;

async function fetch_poe_users() {
    const root = protobuf.parse(protoSchema).root
    const TestMessage = root.lookupType('TestMessage')

    return fetch('https://poe.ninja/api/data/getindexstate?')
        .then(version_response => {
            if (!version_response.ok) {
                throw new Error('An error occurred when trying to fetch index state')
            }
            return version_response.json()
        })
        .then(version_data => {
            for (const category of version_data.snapshotVersions) {
                if (category.url === 'streamers') {
                    return category.version
                }
            }
        })
        .then(version => {
            return fetch(`https://poe.ninja/api/builds/search/${version}?overview=streamers&type=streamers`)
        })
        .then(streamer_response => {
            if (!streamer_response.ok) {
                throw new Error('An error occurred when trying to fetch streamers')
            }
            return streamer_response.arrayBuffer()
        })
        .then(streamer_buffer => {
            let buffer = Buffer.from(streamer_buffer)
            let message = TestMessage.decode(buffer)

            return JSON.parse(JSON.stringify(message.tag1.tag5))
        })
        .then(buffer_message => {
            let chunk_arrays = []
            for (let chunk of buffer_message) {
                chunk = chunk.data
                const decoder = new TextDecoder('utf-8')
                let decoded_string = decoder.decode(new Uint8Array(chunk))
                chunk_arrays.push(decoded_string)
                
            }
            return chunk_arrays
        })
        .then(arrays => {
            let notfiltered = []
            let usablelines = []
            for (let array of arrays) {
                let lines = array.trim().split('\n').filter(line => line.trim() !== '')
                notfiltered.push(lines)
            }
            usablelines.push(notfiltered[0])
            usablelines.push(notfiltered[1])
            return usablelines
        })
        .then(useablelines => {
            let cleaned_lines = []
            for (let lines of useablelines) {
                cleaned_lines.push(lines.map(line => 
                    line.replace(/[\x18\x17\x16\x15\x14\x13\x12\x11\x10\x07\x06\x05\x04\x03\x1C\x1A\x0F\x0E\x0B\x00\t\r\f\b]/g, '')
                ).slice(1))
            }
            return cleaned_lines
        })
        .then(final_lines => {
            let combined = final_lines[0].map((value, idx) => [value, final_lines[1][idx]])
            let mapped = combined.map((value) => {
                return { [value[1]]: value[0] }
            })
            .reduce((user, account) => {
                let key = Object.keys(account)[0]
                if (!(key in user)) {
                    user[key] = account[key]
                }
                return user
            })
            return mapped
        })
        
}

module.exports = {
    fetch_poe_users
}
