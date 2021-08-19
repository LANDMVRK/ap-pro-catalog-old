import Head from 'next/head'
import { useState } from 'react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'

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

function Page(props) {
  const [theme, setTheme] = useState(props.cookies.theme || 'indieHackers')
  const [trash, setTrash] = useState(!props.cookies.trash)

  const t = themes[theme]

  function changeTheme(e) {
    const { theme } = e.target.dataset
    setCookie(null, 'theme', theme, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })
    setTheme(theme)
  }

  function toggleTrash() {
    const { trash } = parseCookies()
    if (trash) {
      destroyCookie(null, 'trash')
      setTrash(true)
      return
    }
    setCookie(null, 'trash', '!', {
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    })
    setTrash(false)
  }

  return (
    <div className="page">
      <Head>
        <title>Каталог AP-PRO.RU</title>
        {/* <meta name="description" content="Generated by create next app" /> */}
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/sticky-sidebar@3.3.1/dist/sticky-sidebar.js"></script>
      </Head>
      <style>
        :root {'{'}
          --color-bg: {t.bg};
          --color-mod-tag-bg: {t.modTagBg};
          --color-radio-border: {t.radioBorder};
          --color-mod-tag: {t.modTag};
          --color-no-bg: {t.noBg};
          --bg-art: url({trash ? '/art.jpg' : ''});
          --color-title-hover: {t.titleHover};
        {'}'}
      </style>
      <div className="theme-picker">
        «Мусор»:<span className="space"> </span><span onClick={toggleTrash} className="theme-picker__garbage-state">{trash ? 'есть' : 'нет'}</span><span className="space"> </span>| Тема:
        <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.graphite.circle}} data-theme="graphite"></div>
        <div onClick={changeTheme} className="theme-picker__circle" style={{background: themes.indieHackers.circle}} data-theme="indieHackers"></div>
      </div>
      <div className="page__logo-wrapper">
      {trash &&
        <a href="https://ap-pro.ru/">
          <img src="/Logo2021_site.png.1d603075f10eb6d7a4300f627d4274d9.png"/>
        </a>
      }
      </div>
      <div className="tile">
        Благодарность
        <div>— <a className="page__link" href="https://ap-pro.ru/profile/1580-chiliaz/">Chiliaz</a> — идея сделать рандомайзер;</div>
        <div>— Всем — за приятную обратную связь и то, что делитесь ссылкой.</div>
        <div style={{marginTop: '16px'}}>Написать автору — <a className="page__link" href="https://t.me/xcmoz">t.me/xcmoz</a></div>
      </div>
      {props.children}
    </div>
  )
}

export default Page