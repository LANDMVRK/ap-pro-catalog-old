import Link from 'next/link'
import Mod from '../components/Mod'
import Page from '../components/Page'
import { RadioGroup, Radio } from '../components/RadioGroup'
import MenuSpoiler from '../components/MenuSpoiler'
import { Form } from 'react-bootstrap'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import random from 'lodash.random'
import nookies from 'nookies'

import { filterAndSort } from '../js/filterAndSort'

const separator = '_'

const CALC_METHOD_MEDIAN = 'median'
const CALC_METHOD_MEAN = 'mean'

const isBrowser = typeof window !== 'undefined'

async function getServerSideProps(ctx) {
  let resp = await fetch('http://localhost/data.json')
  const scraped = await resp.json()

  resp = await fetch('http://localhost/tags.json')
  const tags = await resp.json()

  resp = await fetch('http://localhost/platforms.json')
  const platforms = await resp.json()

  const props = {
    cookies: { ...nookies.get(ctx) },
    scraped, tags, platforms
  }
  return { props: props }
}

function Index(props) {
  console.time('index init')

  const sidebar = useRef()
  
  const [highlighted, setHighlighted] = useState()

  useEffect(function() {
    if (!isBrowser) {
      return
    }
    const s = new StickySidebar(sidebar.current, { topSpacing: 20, bottomSpacing: 20 })
    return function() {
      s.destroy()
    }
  })

  const router = useRouter()

  const { query } = router
  const filters = {
    tags: new Set(query.tags ? query.tags.split(separator) : null),
    platforms: new Set(query.platforms ? query.platforms.split(separator) : null),
    years: new Set(query.years ? query.years.split(separator) : null),
    review: !!query.review,
    video: !!query.video,
    guide: !!query.guide
  }
  let sortType = query['sort_type'] || 'Date'
  let ratingCalcMethod = query['rating_calc_method'] || CALC_METHOD_MEDIAN

  // Надоело эту портянку здесь читать, вынес в функцию.
  const _mods = filterAndSort(props.scraped.Data, filters, sortType, ratingCalcMethod)
  
  const mods = _mods.map(function(m, i) {
    return <Mod key={m.Url} mod={m} outline={highlighted === i} ratingCalcMethod={ratingCalcMethod} />
  })

  const platforms = props.platforms.map(function(p, i) {
    return <Form.Check key={p} label={p} onChange={() => {toggleSet('platforms', p)}} checked={filters.platforms.has(p)} id={'platform' + i} />
  })

  const _years = []
  for (let i = 2007; i <= 2021; i++) {
    _years.push(i.toString())
  }
  const years = _years.map(function(y, i) {
    return <Form.Check key={y} label={y} onChange={() => {toggleSet('years', y)}} checked={filters.years.has(y)} id={'year' + i} />
  })

  const tags = useMemo(function() {
    console.log('tags')
    return props.tags.map(function(t, i) {
      return <Form.Check key={t} label={t} onChange={() => {toggleSet('tags', t)}} checked={filters.tags.has(t)} id={'tag' + i} />
    })
  }, [filters.tags.size])

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

  function selectRandom() {
    setHighlighted(random(mods.length - 1))
  }

  console.timeEnd('index init')
  return (
    <Page {...props}>
      <div style={{display: 'flex'}}>
        <div style={{flexGrow: 1, paddingRight: 20}}>
          {/* <div style={{display: mods.length ? 'none' : null}} className="tile">Ничего не найдено</div> */}
          {mods}
        </div>
        <div ref={sidebar} style={{width: 320, fontSize: 17, flexShrink: 0}}>
          <div onClick={selectRandom} className="tile sidebar-inner ad">
            <div className="ololo">показать случайный мод</div>
          </div>
          <Link href="/random">
            <div className="tile sidebar-inner ad">
                <div className="ololo">Испытать удачу в рулетке</div>
            </div>
          </Link>
          <div className="tile sidebar-inner">
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
            <MenuSpoiler title="Платформа" className="sidebar-list">{platforms}</MenuSpoiler>
            <MenuSpoiler title="Год выхода" className="sidebar-list">{years}</MenuSpoiler>
            <MenuSpoiler title="Теги" className="sidebar-list">{tags}</MenuSpoiler>
            <MenuSpoiler title="Дополнительно" className="sidebar-list">
              <Form.Check label="Есть обзор от Волка" onChange={toggleBool} data-value="review" checked={filters.review} id="add-1" />
              <Form.Check label="Есть видео от Волка" onChange={toggleBool} data-value="video" checked={filters.video} id="add-2" />
              <Form.Check label="Есть гайд на форуме" onChange={toggleBool} data-value="guide" checked={filters.guide} id="add-3" />
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