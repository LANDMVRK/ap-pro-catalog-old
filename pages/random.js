import Page from "../components/Page"

import shuffle from 'lodash.shuffle'

import { data } from '../js/data.js'

import { useState } from 'react'

const isBrowser = typeof window !== 'undefined'

export async function getServerSideProps(context) {
  const { headers, httpVersion, method, url, socket } = context.req
  const ts = new Date().toString()
  const ip = socket.remoteAddress
  
  console.log(`REQUEST HITS! ${ts} ${ip} ${JSON.stringify({ url, method, headers, httpVersion })}\n`)


  return {
    props: {}, // will be passed to the page component as props
  }
}

function Random(props) {
  if (!isBrowser) {
    return <Page />
  }

  // 1. Перетасовать моды
  const shuffled = shuffle(data.Data)
  // 2. Оставить только 50 модов
  const [mods] = useState(shuffled.slice(0, 50))

  const [left, setLeft] = useState(0)

  function roll() {
    setLeft(-250 * 47)
  }

  return (
    <Page>
      <div className="tile">
        <div class="krya">
          <div className="hehe" style={{left: left + 'px'}}>
          {
          mods.map(function(mod) {
            const { Url, PicURL, Rating } = mod
            const ratingColor = Rating >= 7 ? 'lightgreen' : (Rating >= 5 ? 'gold' : 'indianred')
            return (
              <a href={Url} className="hehe__card" style={{backgroundImage: `url(${PicURL})`}} key={mod.Url}>
                <div className="hehe__card-bottom" style={{background: ratingColor}}></div>
              </a>
            )
          })
          }
          </div>
        </div>
        <div className="lalka" onClick={roll}>
          <span className="lalka__text">Прокрутить</span>
        </div>
      </div>
    </Page>
  )
}

export default Random