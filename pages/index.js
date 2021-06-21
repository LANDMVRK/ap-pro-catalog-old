import Link from 'next/link'

import Mod from '../components/Mod'
import Page from '../components/Page'
// import RadioGroup from '../components/RadioGroup'
// import Radio from '../components/Radio'

import { RadioGroup, Radio } from '../components/RadioGroup'

import { useEffect, useRef, useState } from 'react'

import sortBy from 'lodash.sortby'

import { useRouter } from 'next/router'

import { data } from '../js/data.js'

const scraped = data

import tags from '../../tags.json'
import platforms from '../../platforms.json'

import StickySidebar2 from '../sticky-sidebar'

import { formatDistanceStrict } from 'date-fns'
  import { ru } from 'date-fns/locale'

// так надо. должны быть строки...
const years = []
for (let i = 2007; i <= 2021; i++) {
  years.push(i.toString())
}

const separator = '_'

// TO-DO: полоска активные фильтры??

const isBrowser = typeof window !== 'undefined'

let requests = 0
const serverStarted = Date.now()

export async function getServerSideProps(context) {
  requests++

  const { headers, httpVersion, method, url, socket } = context.req
  const ts = new Date().toString()
  const ip = socket.remoteAddress
  
  console.log(`ЗАПРОС. ${ts}
${method} ${url} HTTP/${httpVersion}
IP: ${ip}
${JSON.stringify(headers)}
`)


  return {
    props: {
      requests,
      serverStarted
    }, // will be passed to the page component as props
  }
}



function Index(props) {
  if (!isBrowser) {
    return <Page />
  }

  console.time('index init')

 // Чтобы время запуска сервера не обновлялось при перерендере.
 const [firstRenderTime] = useState(Date.now())

  const kek = useRef()

  if (isBrowser) {
    useEffect(function() {
      const stickySidebar = new StickySidebar(kek.current, {
        topSpacing: 20,
        bottomSpacing: 20
      })
      return function() {
        stickySidebar.destroy()
      }
    })
  }

  // Пачиму-та два начальных рендера((
  // Не критично.

  const router = useRouter()
  console.log(router.query)

  // ----------- ПОДГОТОВКА ДАННЫХ ДЛЯ РЕНДЕРА -----------

  // 1. Парсим URL и устанавливаем фильтры.
  const { query } = router
  const filters = {
    tags: new Set(query.tags ? query.tags.split(separator) : null),
    platforms: new Set(query.platforms ? query.platforms.split(separator) : null),
    years: new Set(query.years ? query.years.split(separator) : null),
    review: !!query.review,
    video: !!query.video,
    screens: !!query.screens,
    guide: !!query.guide
  }
  let sortType = query['sort_type'] || 'Date'

  // 2. Сбрасываем список модов, отображаемых на экране.
  let mods = scraped.Data
  
  // 3. Фильтруем и сортируем список, если надо.
  function filterMods(filterFn) {
    mods = mods.filter(filterFn)
  }

  if (filters.platforms.size) {
    filterMods(function(mod) {
      return filters.platforms.has(mod.Platform) ? true : false
    })
  }

  if (filters.years.size) {
    filterMods(function(mod) {
      for (let year of filters.years) {
        if (mod.ReleaseDate.includes(year)) {
          return true
        }
      }
    })
  }

  if (filters.tags.size) {
    filterMods(function(mod) {
      let find = 0
      mod.Tags.forEach(function(tag) {
        if (filters.tags.has(tag)) {
          find++
        }
      })
      return find === filters.tags.size ? true : false
    })
  }

  if (filters.review) {
    filterMods(function(mod) {
      return mod.Review
    })
  }

  if (filters.video) {
    filterMods(function(mod) {
      return mod.Video
    })
  }

  if (filters.screens) {
    filterMods(function(mod) {
      return mod.Screens
    })
  }

  if (filters.guide) {
    filterMods(function(mod) {
      return mod.Guide
    })
  }

  // Сортировать лучше в конце уже отфильтрованный список.
  if (sortType !== 'Date') {
    mods = sortBy(mods, sortType).reverse()
  }

  // ----------- ОБРАБОТЧИКИ СОБЫТИЙ -----------

  function updateURL() {
    const sp = new URLSearchParams()
    for (const key in filters) {
      const value = filters[key]
      if (value instanceof Set) {
        if (value.size) {
          sp.set(key, Array.from(value).join(separator))
        }
      } else if (value) {
        sp.set(key, value)
      }
    }
    sp.set('sort_type', sortType)
    // форсит перерендер страницы
    router.push('/?' + sp.toString(), undefined, { shallow: true })
  }

  function toggleSet(type, value) {
    const ref = filters[type]
    ref.has(value) ? ref.delete(value) : ref.add(value)
    updateURL()
  }

  function toggleBool(e) {
    const { value } = e.target
    filters[value] = !filters[value]
    updateURL()
  }

  function changeSortType(e) {
    sortType = e
    updateURL()
  }



  console.timeEnd('index init')
  return (
    <Page>
      <div className="tile">
        <div>Заходов на страницу (включая ботов) с момента запуска сервера ({formatDistanceStrict(props.serverStarted, firstRenderTime, { locale: ru, addSuffix: true, roundingMethod: 'floor' })}): {props.requests}</div>
      </div>
      <div className="page__flex-govno">
        <div className="page__main">
          <div style={{display: mods.length ? 'none' : null}} className="tile">Ничего не найдено</div>
        {
        mods.map(function(mod) {
          return <Mod key={mod.Url} mod={mod} />
        })
        }
        </div>
        <div ref={kek} className="page_sidebar">
          <Link href="/random">
            <div className="tile page__sidebar-inner ad">
              {/* <div className="ad__case"></div> */}
                <div className="ololo">Испытать свою удачу</div>
            </div>
          </Link>
          <div class="tile page__sidebar-inner">
            <div className="page__sidebar-title">Тип сортировки</div>

            <RadioGroup name="flexRadioDefault" selectedValue={sortType} onChange={changeSortType}>
              <Radio value="Date" label="По дате публикации" />
              <Radio value="Views" label="По числу просмотров" />
              <Radio value="Rating" label="По рейтингу" />
              <Radio value="Reviews" label="По числу отзывов" />
            </RadioGroup>
              <div className="page__sidebar-title">Платформа</div>
              <div className="page__sidebar-list">
              {
              platforms.map(function(platform, idx) {
                return (
                  <div className="form-check">
                    <input checked={filters.platforms.has(platform)} onChange={() => toggleSet('platforms', platform)} className="form-check-input" type="checkbox" id={'flexCheckDefault' + idx} />
                    <label className="form-check-label" for={'flexCheckDefault' + idx}>
                      {platform}
                    </label>
                  </div>
                )
              })
              }
              </div>
              <div className="page__sidebar-title">Год выхода</div>
              <div className="page__sidebar-list">
                {
                years.map(function(year, idx) {
                  return (
                    <div className="form-check">
                      <input checked={filters.years.has(year)} onChange={() => toggleSet('years', year)} className="form-check-input" type="checkbox" value="" id={'flexCheckDefault22' + idx} />
                      <label className="form-check-label" for={'flexCheckDefault22' + idx}>
                        {year}
                      </label>
                    </div>
                  )
                })
                }
              </div>
              <div className="page__sidebar-title">Теги</div>
              <div className="page__sidebar-list">
              {
              sortBy(tags).map(function(tag, idx) {
                return (
                  <div className="form-check">
                    <input checked={filters.tags.has(tag)} onChange={() => toggleSet('tags', tag)} className="form-check-input" type="checkbox" value="" id={'flexCheckDefault33' + idx} />
                    <label className="form-check-label" for={'flexCheckDefault33' + idx}>
                      {tag}
                    </label>
                  </div>
                )
              })
              }
              </div>
              <div className="page__sidebar-title">Дополнительно</div>
              <div className="page__sidebar-list">
                <div className="form-check">
                  <input checked={filters.review} onChange={toggleBool} className="form-check-input" type="checkbox" value="review" id={'flexCheckDefault123' + 0} />
                  <label className="form-check-label" for={'flexCheckDefault123' + 0}>
                    Есть обзор от Волка
                  </label>
                </div>
                <div className="form-check">
                  <input checked={filters.video} onChange={toggleBool} className="form-check-input" type="checkbox" value="video" id={'flexCheckDefault123' + 1} />
                  <label className="form-check-label" for={'flexCheckDefault123' + 1}>
                    Есть видео от Волка
                  </label>
                </div>
                <div className="form-check">
                  <input checked={filters.screens} onChange={toggleBool} className="form-check-input" type="checkbox" value="screens" id={'flexCheckDefault123' + 2} />
                  <label className="form-check-label" for={'flexCheckDefault123' + 2}>
                    Есть скрины от Волка
                  </label>
                </div>
                <div className="form-check">
                  <input checked={filters.guide} onChange={toggleBool} className="form-check-input" type="checkbox" value="guide" id={'flexCheckDefault123' + 3} />
                  <label className="form-check-label" for={'flexCheckDefault123' + 3}>
                    Есть гайд на форуме
                  </label>
                </div>
              </div>
            </div>
        </div>
      </div>
    </Page>
  )
}

export default Index