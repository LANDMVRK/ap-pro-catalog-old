import Link from 'next/link'

import Mod from '../components/Mod'
import Page from '../components/Page'
import { RadioGroup, Radio } from '../components/RadioGroup'
import Checkbox from '../components/Checkbox'
import IconArrow from '../components/IconArrow'

import { useEffect, useRef, useState } from 'react'

import sortBy from 'lodash.sortby'

import { useRouter } from 'next/router'

import random from 'lodash.random'

// так надо. должны быть строки...
const years = []
for (let i = 2007; i <= 2022; i++) {
  years.push(i.toString())
}

const separator = '_'

// TO-DO: полоска активные фильтры??

const CALC_METHOD_MEDIAN = 'median'
const CALC_METHOD_MEAN = 'mean'

const isBrowser = typeof window !== 'undefined'

// export async function getServerSideProps(context) {
//   const scraped = await fetch('http://localhost/data.json')
//   const scrapedJSON = await scraped.json()

//   const tags = await fetch('http://localhost/tags.json')
//   const tagsJSON = await tags.json()

//   const platforms = await fetch('http://localhost/platforms.json')
//   const platformsJSON = await platforms.json()

//   return {
//     props: {
//       scraped: scrapedJSON,
//       tags: tagsJSON,
//       platforms: platformsJSON
//     }, // will be passed to the page component as props
//   }
// }

import scraped from '../Result of scraping/data.json';

scraped.Data.forEach(mod => {
  mod.ReleaseDate = new Date(mod.ReleaseDate * 1000).toLocaleDateString('ru-RU');

  switch (mod.Platform) {
    case 0: {
      mod.Platform = 'Тень Чернобыля'
      break;
    }
    case 1: {
      mod.Platform = 'Чистое небо'
      break;
    }
    case 2: {
      mod.Platform = 'Зов Припяти'
      break;
    }
    case 3: {
      mod.Platform = 'Arma 3'
      break;
    }
    case 4: {
      mod.Platform = 'DayZ'
      break;
    }
    case 5: {
      mod.Platform = 'Minecraft'
      break;
    }
    case 6: {
      mod.Platform = 'Cry Engine 2'
      break;
    }
  }
});

const hz = new Set();

for (const mod of scraped.Data) {
  for (const tag of mod.Tags) {
    hz.add(tag);
  }
}

const tags = [...hz];

const hz2 = new Set();

for (const mod of scraped.Data) {
  hz2.add(mod.Platform);
}





const platforms = [...hz2];

function Index(props) {
  if (!isBrowser) {
    return <Page />
  }

  // const { scraped, tags, platforms } = props

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

  const [sidebarState, setSidebarState] = useState([1, 1, 1, 1, 1, 1])

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
  let ratingCalcMethod = query['rating_calc_method'] || CALC_METHOD_MEAN//CALC_METHOD_MEDIAN

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
    const { value } = e.target
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

  function toggleSidebarItem(id) {
    setSidebarState(function(prevState) {
      const prev = [...prevState]
      prev[id] = !prev[id]
      return prev
    })
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

  console.timeEnd('index init')
  return (
    <Page>
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
            <div onClick={() => toggleSidebarItem(0)} className="page__sidebar-flex-govno">
              <div>Способ рассчёта рейтинга</div>
              <IconArrow style={{transform: sidebarState[0] ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" />
            </div>
            {sidebarState[0] &&
              <RadioGroup name="egeereg" selectedValue={ratingCalcMethod} onChange={changeRatingCalcMethod}>
                <Radio value={CALC_METHOD_MEDIAN} label="Медиана" />
                <Radio value={CALC_METHOD_MEAN} label="Среднее арифметическое (как на&nbsp;AP-PRO)" />
              </RadioGroup>
            }
            <div onClick={() => toggleSidebarItem(1)} className="page__sidebar-flex-govno">
              <div>Тип сортировки</div>
              <IconArrow style={{transform: sidebarState[1] ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" />
            </div>
            {sidebarState[1] &&
              <RadioGroup name="flexRadioDefault" selectedValue={sortType} onChange={changeSortType}>
                <Radio value="Date" label="По дате публикации" />
                <Radio value="Views" label="По числу просмотров" />
                <Radio value="Rating" label="По рейтингу" />
                <Radio value="Reviews" label="По числу отзывов" />
              </RadioGroup>
            }
            <div onClick={() => toggleSidebarItem(2)} className="page__sidebar-flex-govno">
              <div>Платформа</div>
              <IconArrow style={{transform: sidebarState[2] ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" />
            </div>
            <div style={{display: sidebarState[2] ? null : 'none'}} className="page__sidebar-list">
            {
            platforms.map(function(platform, idx) {
              return <Checkbox key={idx} checked={filters.platforms.has(platform)} onChange={() => toggleSet('platforms', platform)} label={platform} />
            })
            }
            </div>
            <div onClick={() => toggleSidebarItem(3)} className="page__sidebar-flex-govno">
              <div>Год выхода</div>
              <IconArrow style={{transform: sidebarState[3] ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" />
            </div>
            <div style={{display: sidebarState[3] ? null : 'none'}} className="page__sidebar-list">
            {
            years.map(function(year, idx) {
              return <Checkbox key={idx} checked={filters.years.has(year)} onChange={() => toggleSet('years', year)} label={year} />
            })
            }
            </div>
            <div onClick={() => toggleSidebarItem(4)} className="page__sidebar-flex-govno">
              <div>Теги</div>
              <IconArrow style={{transform: sidebarState[4] ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" />
            </div>
            <div style={{display: sidebarState[4] ? null : 'none'}} className="page__sidebar-list">
            {
            tags.map(function(tag, idx) {
              return <Checkbox key={idx} checked={filters.tags.has(tag)} onChange={() => toggleSet('tags', tag)} label={tag} />
            })
            }
            </div>
            {/* <div className="page__sidebar-title">Отзывы</div>
            <div className="page__sidebar-list">
              <Checkbox checked={filters.review} onChange={toggleBool} value="review" label="5 и более" />
              <Checkbox checked={filters.video} onChange={toggleBool} value="video" label="10 и более" />
              <Checkbox checked={filters.screens} onChange={toggleBool} value="screens" label="15 и более" />
            </div> */}
            <div style={{marginBottom: sidebarState[5] ? null : '0'}} onClick={() => toggleSidebarItem(5)} className="page__sidebar-flex-govno">
              <div>Дополнительно</div>
              <IconArrow style={{transform: sidebarState[5] ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" />
            </div>
            <div style={{display: sidebarState[5] ? null : 'none'}} className="page__sidebar-list">
              <Checkbox checked={filters.review} onChange={toggleBool} value="review" label="Есть обзор от Волка" />
              <Checkbox checked={filters.video} onChange={toggleBool} value="video" label="Есть видео от Волка" />
              <Checkbox checked={filters.screens} onChange={toggleBool} value="screens" label="Есть скрины от Волка" />
              <Checkbox checked={filters.guide} onChange={toggleBool} value="guide" label="Есть гайд на форуме" />
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Index