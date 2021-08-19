import { useEffect, useRef } from 'react'

import { getRatingColor } from '../js/getRatingColor'

function Mod(props) {
  const ref = useRef()

  useEffect(function() {
    if (props.outline) {
      ref.current.scrollIntoView()
    }
  })

  const { Url, Title, PicBase, Description, ReleaseDate } = props.mod
  
  const r = props.ratingCalcMethod === 'median' ? props.mod.MedianRating : props.mod.Rating
  const ratingColor = getRatingColor(r)
  const rating = r.toString().replace('.', ',')

  const v = props.mod.Views
  const views = v > 9999 ? new Intl.NumberFormat('ru-ru').format(v) : v

  const tags = props.mod.Tags.map(function(t) {
    return <div key={t} className="mod-tag">{t}</div>
  })

  return (
    <div ref={ref} className="tile" style={{outline: props.outline ? '3px solid violet' : null}}>
      <a className="mod-title" href={Url} target="_blank" rel="noopener noreferrer">{Title}</a>
      <div className="mod-container">
        <div className="mod-preview-wrapper">
          <img className="mod-preview" src={'/previews/' + PicBase} loading="lazy" />
        </div>
        <div>
          <div className="mod-description">{Description}</div>
          {tags}
        </div>
      </div>
      <span className="mod-bottom-item">Рейтинг: <span style={{color: ratingColor}}>{rating}</span></span>
      <span className="mod-bottom-item">Просмотры: {views}</span>
      <span className="mod-bottom-item">Опубликован: {ReleaseDate}</span>
    </div>
  )
}

export default Mod