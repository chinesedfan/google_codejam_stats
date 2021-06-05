const path = require('path')
const axios = require('axios')

printAllLanguages('000000000043585d')

function buildScoreFilePath(roundid) {
    return path.resolve(__dirname, `../client/public/round_data/scores/${roundid}.json`)
}

function printAllLanguages(roundid, limit = 50) {
    const scores = require(buildScoreFilePath(roundid))
    const tasks = []
    let done = 0
    scores.some(({ rank, displayname }, i) => {
        if (i >= limit) return true

        const task = loadAttempts(roundid, displayname)
            .then(({ attempts }) => {
                done++
                if (!(done % 10)) {
                    console.log(`...${done}/${limit}`)
                }
                return extractLanguages(attempts)
            })
            .then(langs => `#${rank} - ${displayname} - ${langs.join(',')}`)
        tasks.push(task)
    })

    Promise.all(tasks)
        .then(msgs => {
            console.log(msgs.join('\n'))
        })
}

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
        .catch(e => {
            console.log(`Failed to load for ${nickname}: ${e}`)
            return { attempts: [] }
        })
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
