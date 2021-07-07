const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const path = require('path')
const fs = require('fs')

let requests = 0

const app = express()

// Next.js отдает ток ассеты, которые были в папке /public на момент сборки,   
// поэтому при обновлении инфы о модах надо перезапустить сервер.
// Это не круто.
app.use(express.static(path.join(__dirname, '../Result of scraping')))
app.use('/', loggerMiddleware)
app.use('/', createProxyMiddleware('http://localhost:3000'))

app.listen(80)
console.log('Express started on port 80')
try {
    fs.appendFileSync(path.join(__dirname, 'server.log'), 'Express started on port 80\n')
} catch (err) {

}

async function loggerMiddleware(req, res, next) {
    const url = req.url
    if (!url.includes('.')) {
        log(req)
    } else if (url.startsWith('/_next/data')) {
        log(req)
    }
    next()
}

function log(req) {
    requests++

    const { headers, httpVersion, method, url, socket } = req
    const ts = new Date().toString()
    const ip = socket.remoteAddress

    const message = `ЗАПРОС ${requests}. ${ts}
${method} ${url} HTTP/${httpVersion}
IP: ${ip}
${JSON.stringify(headers)}
`
    fs.appendFile(path.join(__dirname, 'server.log'), message + '\n', function(err) {
        if (err) {
            throw err
        }
    })
}