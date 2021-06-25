import Page from "../components/Page"

import shuffle from 'lodash.shuffle'
import random from 'lodash.random'

import { data } from '../js/data.js'

import { useState, useRef } from 'react'

import { getRatingColor } from '../js/getRatingColor'
import { getBase } from '../js/getBase'

import BezierEasing from 'bezier-easing'

import play from 'audio-play'
import load from 'audio-loader'

const isBrowser = typeof window !== 'undefined'

const easing = BezierEasing(0.33, 1, 0.68, 1)

let pik
if (isBrowser) {
  load('/CS_GO Case + Knife Opening Sound Effect (audio-extractor (mp3cut.net).wav').then(function(buffer) {
    pik = buffer // => <AudioBuffer>
  })
}

let requests = 0

export async function getServerSideProps(context) {
  requests++

  const { headers, httpVersion, method, url, socket } = context.req
  const ts = new Date().toString()
  const ip = socket.remoteAddress
  
  console.log(`ЗАПРОС ${requests}. ${ts}
${method} ${url} HTTP/${httpVersion}
IP: ${ip}
${JSON.stringify(headers)}
`)

  return {
    props: {}, // will be passed to the page component as props
  }
}

function Random(props) {
  if (!isBrowser) {
    return <Page />
  }

  function getMods() {
    return shuffle(data.Data).slice(0, 50)
  }

  const [mods, setMods] = useState(getMods())
  const [left, setLeft] = useState(0)

  const stateInitial = 0
  const statePending = 1
  const stateReady = 2

  const [btnState, chgBtnState] = useState(stateInitial)

  const ref = useRef()
  
  function roll() {
    if (btnState === statePending) {
      return
    }

    const newLeft = -250 * 47 + random(250)

    setLeft(function(prevState) {
      if (prevState !== 0) {
        setMods(getMods())
        // https://stackoverflow.com/questions/34726154/temporarily-bypass-a-css-transition
        const element = ref.current
        element.style.transition = "none"
        element.style.left = "0"
        // apply the "transition: none" and "left: Xpx" rule immediately
        flushCss(element);
        // restore animation
        element.style.transition = "";
      }
      return newLeft
    })

    let prevBlock = 2
    const animationDuration = 7500

    const start = Date.now()
    // https://learn.javascript.ru/css-animations#transition-timing-function
    const interval = setInterval(function() {
      const since = Date.now() - start
      const progress = easing(since/animationDuration)
      const currentLeft = newLeft * progress

      const blockWIdth = 250
      // на каком блоке сейчас стрела
      const currentBlock = Math.ceil((currentLeft + -(blockWIdth * 1.5)) / -blockWIdth)
      if (currentBlock > prevBlock && pik) {
          play(pik).play()
      }
      prevBlock = currentBlock

      if (since > animationDuration) {
        clearInterval(interval)
        // console.log('interval cleared')
      }
    }, 75)


    chgBtnState(statePending)
    setTimeout(function() {
      chgBtnState(stateReady)
    }, animationDuration)
  }

  function flushCss(element) {
    // By reading the offsetHeight property, we are forcing
    // the browser to flush the pending CSS changes (which it
    // does to ensure the value obtained is accurate).
    element.offsetHeight;
  }

  return (
    <Page>
      <div className="tile">
        <div class="krya">
          <div className="hehe" ref={ref} style={{left: left + 'px'}}>
          {
          mods.map(function(mod) {
            const { Url, PicURL, Rating } = mod
            const ratingColor = getRatingColor(Rating)
            return (
              <a href={Url} className="hehe__card" style={{backgroundImage: `url(/previews/${getBase(PicURL)})`}} key={mod.Url}>
                <div className="hehe__card-bottom" style={{background: ratingColor}}></div>
              </a>
            )
          })
          }
          </div>
        </div>
        <div className="lalka" onClick={roll}>
          <span className="lalka__text">
            {btnState === stateInitial ? 'Прокрутить' : (btnState === statePending ? 'Ожидайте...' : 'Прокрутить снова')}
          </span>
        </div>
      </div>
    </Page>
  )
}

export default Random