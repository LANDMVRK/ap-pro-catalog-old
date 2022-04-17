import Head from 'next/head'

import { useState } from 'react'

const themes = {
  graphite: {
    circle: 'hsl(209deg 0% 14%)',
    bg: 'hsl(209deg 0% 14% / 70%)',
    modTagBg: 'hsl(210deg 0% 21%)',
    radioBorder: 'hsl(210deg 0% 54%)',
    modTag: 'hsl(210deg 0% 80%)',
    noBg: 'hsl(210deg 0% 7%)',
    titleHover: 'palegoldenrod'
  },
  indieHackers: {
    circle: 'hsl(209deg 61% 14%)',
    bg: 'hsl(209deg 61% 14% / 70%)',
    modTagBg: '#1f354c',
    radioBorder: '#6b8aa8',
    modTag: '#b6cce2',
    noBg: '#041220',
    titleHover: 'palegoldenrod'
  },
  pink: {
    circle: 'hsl(313deg 61% 14%)',
    bg: 'hsl(313deg 61% 14% / 70%)',
    modTagBg: 'hsl(313deg 42% 21%)',
    radioBorder: 'hsl(313deg 26% 54%)',
    modTag: 'hsl(313deg 43% 80%)',
    noBg: 'hsl(313deg 78% 7%)',
    titleHover: 'palegoldenrod'
  }
}


const isBrowser = typeof window !== 'undefined'

function Page(props) {
  let t
  if (isBrowser) {
    t = localStorage.getItem('theme')
  }

  const [currentTheme, setTheme] = useState(t || 'indieHackers')

  const lol = themes[currentTheme]

  let g
  if (isBrowser) {
    g = localStorage.getItem('garbage')
  }

  const [garbage, setGarbage] = useState(g || 'true')

  const test = `
    :root {
      --color-bg: ${lol.bg};
      --color-mod-tag-bg: ${lol.modTagBg};
      --color-radio-border: ${lol.radioBorder};
      --color-mod-tag: ${lol.modTag};
      --color-no-bg: ${lol.noBg};
      --color-title-hover: ${lol.titleHover};
      --bg-art: ${garbage === 'true' ? 'url(/art.jpg)' : 'url()'};
    }
  `

  function changeTheme(e) {
    const { theme } = e.target.dataset
    setTheme(theme)
    try {
      localStorage.setItem('theme', theme)
    } catch (err) {}
  }

  function toggleGarbage() {
    setGarbage(function(prevState) {
      const newState = prevState === 'true' ? 'false' : 'true'
      try {
        localStorage.setItem('garbage', newState)
      } catch (err) {}
      return newState
    })
  }

    return (
      <div className="page">
        <Head>
          <title>Каталог AP-PRO.RU</title>
          {/* <meta name="description" content="Generated by create next app" /> */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
          <script src="https://unpkg.com/sticky-sidebar@3.3.1/dist/sticky-sidebar.js"></script>
        </Head>
        <style>{test}</style>
        <div className="theme-picker">
          «Мусор»:<span className="space"> </span><span onClick={toggleGarbage} className="theme-picker__garbage-state">{garbage === 'true' ? 'есть' : 'нет'}</span><span className="space"> </span>| Тема:
          <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.graphite.circle}} data-theme="graphite"></div>
          <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.indieHackers.circle}} data-theme="indieHackers"></div>
          {/* <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.pink.circle}} data-theme="pink"></div> */}
          </div>
        <div className="page__logo-wrapper">
        {garbage === 'true' &&
          <a href="https://ap-pro.ru/">
            <img className="page__logo" src="/Logo2021_site.png.1d603075f10eb6d7a4300f627d4274d9.png"/>
          </a>
        }
        </div>
        <div className="tile">
          Благодарность
          <div>— <a className="page__link" href="https://ap-pro.ru/profile/1580-chiliaz/">Chiliaz</a> — идея сделать рандомайзер;</div>
          <div>— Всем — за приятную обратную связь и то, что делитесь ссылкой.</div>
          <div style={{marginTop: '16px'}}>Написать автору — <a className="page__link" href="https://t.me/cczcx">t.me/cczcx</a></div>
        </div>
        {props.children}
      </div>
    )
}

export default Page