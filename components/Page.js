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
    }
  }

  import { formatDistanceStrict } from 'date-fns'
  import { ru } from 'date-fns/locale'

function Page(props) {

  // Чтобы время запуска сервера не обновлялось при перерендере.
  const [firstRenderTime] = useState(Date.now())

  // TO-DO: сохранеие выбранной темы в localStorage
  const [currentTheme, setTheme] = useState('indieHackers')

  const lol = themes[currentTheme]

  const [garbage, setGarbage] = useState(true)

  const test = `
    :root {
      --color-bg: ${lol.bg};
      --color-mod-tag-bg: ${lol.modTagBg};
      --color-radio-border: ${lol.radioBorder};
      --color-mod-tag: ${lol.modTag};
      --color-no-bg: ${lol.noBg};
      --color-title-hover: ${lol.titleHover};
      --bg-art: ${garbage ? 'url(/art.jpg)' : 'url()'};
    }
  `

  function changeTheme(e) {
    setTheme(e.target.dataset.theme)
  }

  function toggleGarbage() {
    setGarbage(prevState => !prevState)
  }

    return (
      <div className="page">
        <Head>
          <title>Каталог AP-PRO.RU</title>
          {/* <meta name="description" content="Generated by create next app" /> */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
        </Head>
        <style>{test}</style>
        <div className="theme-picker">
          «Мусор»:<span className="space"> </span><span onClick={toggleGarbage} className="theme-picker__garbage-state">{garbage ? 'есть' : 'нет'}</span><span className="space"> </span>| Тема:
          <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.graphite.circle}} data-theme="graphite"></div>
          <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.indieHackers.circle}} data-theme="indieHackers"></div>
          </div>
        <div className="page__logo-wrapper">
        {garbage &&
          <a href="https://ap-pro.ru/">
            <img className="page__logo" src="/Logo2021_site.png.1d603075f10eb6d7a4300f627d4274d9.png"/>
          </a>
        }
        </div>
        {/* TO-DO: создать новый класс для блока */}
        {/* <div className="mod">
          <div>Заходов на страницу (включая ботов) с момента запуска сервера ({formatDistanceStrict(props.serverStarted, firstRenderTime, { locale: ru, addSuffix: true, roundingMethod: 'floor' })}): {props.requests}</div>
        </div> */}
        {props.children}
      </div>
    )
}

export default Page