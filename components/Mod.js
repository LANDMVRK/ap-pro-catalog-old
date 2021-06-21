function Mod(props) {
    const { Url, Title, PicURL, Description, Tags, Views, ReleaseDate, Rating } = props.mod
    const ratingColor = Rating >= 7 ? 'lightgreen' : (Rating >= 5 ? 'gold' : 'indianred')
    const displayedRating = Rating.toString().replace('.', ',')
    const displayedViews = Views > 9999 ? new Intl.NumberFormat('ru-ru').format(Views) : Views
    return (
      <div className="tile mod">
        <a className="mod__title" href={Url}>{Title}</a>
        <div className="mod__flex-govno">
          <div className="mod__preview-wrapper">
            <img className="mod__preview" src={PicURL} loading="lazy" />
          </div>
          <div className="mod__description">
            {Description}
            <div className="mod__tags">
            {
              Tags.map(function(tag) {
                return <div className="mod__tags-item">{tag}</div>
              })
            }
            </div>
          </div>
        </div>
        <div className="mod__bottom-item">Рейтинг: <span style={{color: ratingColor}}>{displayedRating}</span></div>
        <div className="mod__bottom-item">Просмотры: {displayedViews}</div>
        <div className="mod__bottom-item">Опубликован: {ReleaseDate}</div>
      </div>
    )
}

export default Mod