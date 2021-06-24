let modsData = {}

async function main() {
    const pages = []
    for (let i = 1; i <= getLastPage(); i++) {
        pages.push(`/stuff/page/${i}/`)
    }
    console.log(`Получение содержимого страниц каталога...`)
    const pagesContent = await getContent(pages)
    console.log(`Извлечение ссылок на моды со страниц каталога...`)
    const mods = wrapper(pagesContent, collectMods)
    console.log(`Найдено модов: ${mods.length}`)
    console.log(`Получение содержимого страниц с модами...`)
    const modsContent = await getContent(mods)
    modsData.scraped = Date.now()
    console.log(`Извлечение информации со страниц с модами...`)
    const data = wrapper(modsContent, collectInfo)
    modsData.data = data.map((m, idx) => {
        m.url = mods[idx]
        return m
    })
    console.log(`Все. Введите copy(modsData) и вставьте в текстовый файл`)
}

function getLastPage() {
    const x = document.querySelector(`.ipsPagination_last a`)
    return +x.dataset.page
}

async function getContent(URLs) {
    try {
        const responses = await Promise.all(URLs.map(url => fetch(url)))
        responses.forEach(r => {
            if (!r.ok) {
                throw new Error(`${r.url} not ok`)
            }
        })
        return await Promise.all(responses.map(r => r.text()))
    } catch (err) {
        console.error(err)
    }
}

function wrapper(HTMLPages, fn) {
    const result = []
    HTMLPages.forEach(p => {
        if (!window.x) {
            x = document.createElement(`template`)
        }
        x.innerHTML = trimPage(p)
        fn(x.content, result)
    })
    return result
}

function trimPage(p) {
    const idx1 = p.search(/<body[^>]*>/)
    const idx2 = p.indexOf(`>`, idx1) + 1
    const idx3 = p.lastIndexOf(`</body>`)
    return p.slice(idx2, idx3)
}

function collectMods(doc, result) {
    const titles = doc.querySelectorAll(`header h2 a[title^="Подробнее о"]`)
    titles.forEach(t => {
        result.push(t.href)
    })
}

function collectInfo(doc, result) {
    const mod = {
        title: doc.querySelector(`.ipsPageHeader .ipsType_pageTitle span`).innerText,
        picURL: doc.querySelector(`.modInfoGrid .cCmsRecord_image`).style.backgroundImage.slice(5, -2),
        authors: doc.querySelector(`.modInfoGrid .fa-user`).parentNode.innerText.slice(1),
        releaseDate: doc.querySelector(`.modInfoGrid .fa-clock-o`).parentNode.innerText.slice(1),
        views: +doc.querySelector(`.modInfoGrid .fa-eye`).parentNode.innerText.split(`|`)[0],
        rating: +doc.querySelector(`.modInfoGrid .fa-line-chart`).parentNode.innerText.match(/\d(,\d)?/)[0].replace(`,`, `.`),
        reviews: +doc.querySelector(`.modInfoGrid .fa-line-chart`).parentNode.innerText.match(/(\d+) отзыв/)[1],
        description: doc.querySelector(`article section p`).innerText.slice(2, -1),
        video: doc.querySelector(`article .additionalButtons`).innerText.includes(`Видео`),
        guide: doc.querySelector(`article .additionalButtons`).innerText.includes(`Прохожден`),
        screens: doc.querySelector(`article .additionalButtons`).innerText.includes(`Скрин`),
        review: doc.querySelector(`article .additionalButtons`).innerText.includes(`Обзор`),
        tags: []
    }

    const platform = doc.querySelector(`.modInfoGrid .fa-folder-open-o`).parentNode.innerText.slice(1)
    switch (platform) {
        case `Тень Чернобыля`:
            mod.platform = 0
            break
        case `Чистое небо`:
            mod.platform = 1
            break
        case `Зов Припяти`:
            mod.platform = 2
            break
        case `Arma 3`:
            mod.platform = 3
            break
        case `DayZ`:
            mod.platform = 4
            break
        default:
            console.warn(`Unknown platform ${platform} (${mod.title}). Update code.`)
            mod.platform = platform
    }

    // TO-DO: как дла платформы сделать
    const tags = doc.querySelectorAll(`.ipsTags.ipsList_inline li span`)
    tags.forEach(t => {
        mod.tags.push(t.innerText)
    })

    result.push(mod)
}

main()