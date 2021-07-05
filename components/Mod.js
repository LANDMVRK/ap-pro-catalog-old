import { getRatingColor } from '../js/getRatingColor'

function Mod(props) {
    const { Url, Title, PicBase, Description, Tags, Views, ReleaseDate } = props.mod
    
    const Rating = props.ratingCalcMethod === 'median' ? props.mod.MedianRating : props.mod.Rating
    
    const ratingColor = getRatingColor(Rating)
    const displayedRating = Rating.toString().replace('.', ',')
    const displayedViews = Views > 9999 ? new Intl.NumberFormat('ru-ru').format(Views) : Views
    return (
      <div className="tile mod">
        <a className="mod__title" href={Url}>{Title}</a>
        <div className="mod__flex-govno">
          <div className="mod__preview-wrapper">
            <img className="mod__preview" src={'/previews/' + PicBase} loading="lazy" />
          </div>
          <div className="mod__description">
            <div className="mod__description-text">{Description}</div>
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