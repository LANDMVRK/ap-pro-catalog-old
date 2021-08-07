import Link from 'next/link'

import Mod from '../components/Mod'
import Page from '../components/Page'
import { RadioGroup, Radio } from '../components/RadioGroup'
import MenuSpoiler from '../components/MenuSpoiler'

import { useEffect, useRef, useState } from 'react'

import sortBy from 'lodash.sortby'

import { useRouter } from 'next/router'

import random from 'lodash.random'

import nookies from 'nookies'

import { Form } from 'react-bootstrap'

// так надо. должны быть строки...
const years = []
for (let i = 2007; i <= 2021; i++) {
  years.push(i.toString())
}

const separator = '_'

// TO-DO: полоска активные фильтры??

const CALC_METHOD_MEDIAN = 'median'
const CALC_METHOD_MEAN = 'mean'

const isBrowser = typeof window !== 'undefined'

async function getServerSideProps(ctx) {
  const scraped = await fetch('http://localhost/data.json')
  const scrapedJSON = await scraped.json()

  const tags = await fetch('http://localhost/tags.json')
  const tagsJSON = await tags.json()

  const platforms = await fetch('http://localhost/platforms.json')
  const platformsJSON = await platforms.json()

  return {
    props: {
      cookies: { ...nookies.get(ctx) },
      scraped: scrapedJSON,
      tags: tagsJSON,
      platforms: platformsJSON
    }, // will be passed to the page component as props
  }
}



function Index(props) {
  // if (!isBrowser) {
  //   // cookies
  //   return <Page />
  // }

  const { scraped } = props

  console.time('index init')

 // Чтобы время запуска сервера не обновлялось при перерендере.
//  const [firstRenderTime] = useState(Date.now())

  const kek = useRef()
  const main = useRef()

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
  // UPD: не актуально с SSR.

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
  let ratingCalcMethod = query['rating_calc_method'] || CALC_METHOD_MEDIAN

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
    const modsClone = [...mods]
    modsClone.reverse()
    let field
    if (sortType === 'Rating') {
      field = ratingCalcMethod === CALC_METHOD_MEDIAN ? 'MedianRating' : 'Rating'
    } else {
      field = sortType
    }
    mods = sortBy(modsClone, field).reverse()
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
    sp.set('rating_calc_method', ratingCalcMethod)
    // форсит перерендер страницы
    router.push('/?' + sp.toString(), undefined, { shallow: true })
  }

  function toggleSet(type, value) {
    const ref = filters[type]
    ref.has(value) ? ref.delete(value) : ref.add(value)
    updateURL()
  }

  function toggleBool(e) {
    const { value } = e.currentTarget.dataset
    filters[value] = !filters[value]
    updateURL()
  }

  function changeSortType(e) {
    sortType = e
    updateURL()
  }
  
  function changeRatingCalcMethod(e) {
    ratingCalcMethod = e
    updateURL()
  }

  // TO-DO: переписать более react way
  function selectRandom() {
    if (!mods.length) {
      return
    }
    // сбросить аутлайн
    const withOutline =  main.current.querySelector('.mod[style]')
    if (withOutline) {
      withOutline.removeAttribute('style')
    }

    const n = random(mods.length - 1)
    const m = main.current.querySelectorAll('.mod')
    const el = m[n]
    el.scrollIntoView()
    // А если мод в самом низу страницы? Надо еще и подсветить.
    el.style.outline = '3px solid violet'
  }

  const platforms = props.platforms.map(function(p, i) {
    return <Form.Check key={p} label={p} onChange={() => {toggleSet('platforms', p)}} checked={filters.platforms.has(p)} id={'platform' + i} />
  })

  // usememo??
  // or https://reactjs.org/docs/lists-and-keys.html#embedding-map-in-jsx

  const list2 = years.map(function(y, i) {
    return <Form.Check key={y} label={y} onChange={() => {toggleSet('years', y)}} checked={filters.years.has(y)} id={'year' + i} />
  })

  const tags = props.tags.map(function(t, i) {
    return <Form.Check key={t} label={t} onChange={() => {toggleSet('tags', t)}} checked={filters.tags.has(t)} id={'tag' + i} />
  })

  console.timeEnd('index init')
  return (
    <Page {...props}>
      {/* <div className="tile">
        <div>Заходов на страницу (включая ботов) с момента запуска сервера ({formatDistanceStrict(props.serverStarted, firstRenderTime, { locale: ru, addSuffix: true, roundingMethod: 'floor' })}): {props.requests}</div>
      </div> */}
      <div className="page__flex-govno">
        <div ref={main} className="page__main">
          <div style={{display: mods.length ? 'none' : null}} className="tile">Ничего не найдено</div>
        {
        mods.map(function(mod) {
          return <Mod key={mod.Url} mod={mod} ratingCalcMethod={ratingCalcMethod} />
        })
        }
        </div>
        <div ref={kek} className="page_sidebar">
          <div onClick={selectRandom} className="tile page__sidebar-inner ad">
              <div className="ololo">показать случайный мод</div>
          </div>
          <Link href="/random">
            <div className="tile page__sidebar-inner ad">
                <div className="ololo">Испытать удачу в рулетке</div>
            </div>
          </Link>
          <div class="tile page__sidebar-inner">
            <MenuSpoiler title="Способ рассчёта рейтинга">
              <RadioGroup name="egeereg" selectedValue={ratingCalcMethod} onChange={changeRatingCalcMethod}>
                <Radio value={CALC_METHOD_MEDIAN} label="Медиана" />
                <Radio value={CALC_METHOD_MEAN} label="Среднее арифметическое (как на&nbsp;AP-PRO)" />
              </RadioGroup>
            </MenuSpoiler>
            <MenuSpoiler title="Тип сортировки">
              <RadioGroup name="flexRadioDefault" selectedValue={sortType} onChange={changeSortType}>
                <Radio value="Date" label="По дате публикации" />
                <Radio value="Views" label="По числу просмотров" />
                <Radio value="Rating" label="По рейтингу" />
                <Radio value="Reviews" label="По числу отзывов" />
              </RadioGroup>
            </MenuSpoiler>
            <MenuSpoiler title="Платформа">
              <div className="page__sidebar-list">{platforms}</div>
            </MenuSpoiler>
            <MenuSpoiler title="Год выхода">
              <div className="page__sidebar-list">{list2}</div>
            </MenuSpoiler>
            <MenuSpoiler title="Теги">
              <div className="page__sidebar-list">{tags}</div>
            </MenuSpoiler>
            <MenuSpoiler title="Дополнительно">
              <div className="page__sidebar-list">
                <Form.Check label="Есть обзор от Волка" onChange={toggleBool} data-value="review" checked={filters.review} id="add-1" />
                <Form.Check label="Есть видео от Волка" onChange={toggleBool} data-value="video" checked={filters.video} id="add-2" />
                <Form.Check label="Есть гайд на форуме" onChange={toggleBool} data-value="guide" checked={filters.guide} id="add-3" />
              </div>
            </MenuSpoiler>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Index
export {
  getServerSideProps
}