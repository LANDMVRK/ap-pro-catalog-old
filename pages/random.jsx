import shuffle from 'lodash.shuffle'
import random from 'lodash.random'
import BezierEasing from 'bezier-easing'
import load from 'audio-loader'
import play from 'audio-play'
import { useState, useRef } from 'react'
import nookies from 'nookies'

import Page from "../components/Page"
import { getRatingColor } from '../js/getRatingColor'

const isBrowser = typeof window !== 'undefined'

// --------- НАСТРОЙКИ АНИМАЦИИ И ЗВУКА ---------
const cardWidth = 250 // Из CSS.
const numOfModsToChooseFrom = 50
const animationDuration = 7500
const easingFunc = [0.33, 1, 0.68, 1]
const pathToSound = '/CS_GO Case + Knife Opening Sound Effect (audio-extractor (mp3cut.net).wav'

// --------- СОСТОЯНИЕ КНОПКИ ---------
const stateInitial = 0
const statePending = 1
const stateReadyForExtraSpin = 2

let pik
if (isBrowser) {
  load(pathToSound).then(function(buffer) {
    pik = buffer // => <AudioBuffer>
  })
}

const easing = BezierEasing(...easingFunc)
const style = `
  .hehe {
    transition: transform ${animationDuration}ms cubic-bezier(${easingFunc.join()});
  }
`

function Random(props) {
  // if (!isBrowser) {
  //   // cookies...
  //   return <Page />
  // }

  const listOfMods = props.data.Data

  if (numOfModsToChooseFrom > listOfMods.length) {
    throw new Error('numOfModsToChooseFrom > listOfMods.length')
  }

  function getMods() {
    return shuffle(listOfMods).slice(0, numOfModsToChooseFrom)
  }

  // https://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
  // https://medium.com/@iamryanyu/should-i-do-the-animation-with-left-or-translatex-49b65a09cf38
  // https://webformyself.com/css-ot-a-do-ya-raznica-mezhdu-translate-i-position-relative/

  const [mods, setMods] = useState(getMods())
  const [left, setLeft] = useState(0)
  const [btnState, chgBtnState] = useState(stateInitial)

  const ref = useRef()
  
  function roll() {
    if (btnState === statePending) {
      return
    }
    if (btnState === stateReadyForExtraSpin) {
      setMods(getMods())

      const el = ref.current
      el.style.transition = 'none'
      el.style.transform = 'translateX(0)'
      el.offsetHeight // https://gist.github.com/paulirish/5d52fb081b3570c81e3a
      el.style.transition = ''
    }

    chgBtnState(statePending)

    const newOffset = cardWidth * (numOfModsToChooseFrom - 3) * -1 + random(cardWidth)
    setLeft(newOffset) // Запустить анимацию.

    setTimeout(function() {
      chgBtnState(stateReadyForExtraSpin)
    }, animationDuration)

    // Весь код далее отвечает за звук.
    let prevCard = 2

    const start = Date.now()
    const interval = setInterval(function() {
      const since = Date.now() - start

      // Если к моменту прокрута звук не успел загрузиться,
      // начнет проигрываться, когда загрузится.
      if (pik) {
        // https://learn.javascript.ru/css-animations#transition-timing-function
        const progress = easing(since / animationDuration)
        const currentOffset = newOffset * progress // Отрицательное число.
        const tmp = (currentOffset + cardWidth * -1.5) / -cardWidth
        const currentCard = Math.ceil(tmp) // На каком моде сейчас стрела.
        if (currentCard > prevCard) {
            play(pik).play()
        }
        prevCard = currentCard
      }

      if (since > animationDuration) {
        clearInterval(interval)
      }
    }, 50)
  }

  return (
    <Page {...props}>
      <div className="tile">
        <div className="krya">
          <style>{style}</style>
          <div className="hehe" ref={ref} style={{transform: `translateX(${left}px)`}}>
          {
          mods.map(function(mod) {
            const { Url, PicBase, Rating } = mod
            const ratingColor = getRatingColor(Rating)
            return (
              <a href={Url} className="hehe__card" style={{backgroundImage: `url(/previews/${PicBase})`}} key={mod.Url}>
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

async function getServerSideProps(ctx) {
  const scraped = await fetch('http://localhost/data.json')
  const scrapedJSON = await scraped.json()

  return {
    props: {
      cookies: { ...nookies.get(ctx) },
      data: scrapedJSON
    }, // will be passed to the page component as props
  }
}

export default Random
export {
  getServerSideProps
}