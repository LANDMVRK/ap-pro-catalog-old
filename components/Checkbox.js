import times from 'lodash.times'
import random from 'lodash.random'

function Checkbox(props) {
  const { checked, onChange, value, label } = props
  const id =
    times(20, function() {
      return random(35).toString(36)
    })
    .join('')
  return (
    <div className="form-check">
      <input checked={checked} onChange={onChange} className="form-check-input" type="checkbox" value={value} id={id} />
      <label className="form-check-label" for={id}>
        {label}
      </label>
    </div>
  )
}

export default Checkbox