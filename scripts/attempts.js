const axios = require('axios')

loadAttempts('0000000000435c44', 'chinesedfan')
    .then(({ attempts }) => extractLanguages(attempts))
    .then(console.log)

function buildURL(roundid, nickname) {
    const p = Buffer.from(JSON.stringify({
        nickname,
        include_non_final_results: true
    })).toString('base64')
    return `https://codejam.googleapis.com/attempts/${roundid}/poll?p=${p}`
}

// @returns { attempts, challenge }
async function loadAttempts(roundid, nickname) {
    return axios(buildURL(roundid, nickname))
        .then(({ data }) => JSON.parse(Buffer.from(data, 'base64')))
        .catch(e => console.log(`Failed to load for ${nickname}: ${e}`))
}

function extractLanguages(attempts, onlySolved = false) {
    const langs = {}
    attempts.forEach(({ src_language__str, judgement }) => {
        let valid = true
        if (onlySolved) {
            valid = judgement.results.every(({ verdict }) => verdict === 1)
        }

        if (valid) {
            langs[src_language__str] = 1
        }
    })
    return Object.keys(langs).sort()
}
