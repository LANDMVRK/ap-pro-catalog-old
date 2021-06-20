// Основа - https://github.com/chenglou/react-radio-group

import React from 'react';

const MyContext = React.createContext()

class Radio extends React.Component {
  render() {
    const {name, selectedValue, onChange} = this.context.radioGroup;
    const optional = {};
    if(selectedValue !== undefined) {
      optional.checked = (this.props.value === selectedValue);
    }
    if(typeof onChange === 'function') {
      optional.onChange = onChange.bind(null, this.props.value);
    }

    const id = name + this.props.value

    return (
      <div className="form-check">
        <input
          className="form-check-input"
          id={id}
          
          // {...this.props}
          role="radio"
          aria-checked={optional.checked}
          type="radio"
          name={name}
          {...optional}  />
        <label className="form-check-label" for={id}>
          {this.props.label}
        </label>
      </div>
    )
  }
};

Radio.contextType = MyContext

function RadioGroup(props) {
  const { name, selectedValue, onChange, children, ...rest} = props
  const val = {
    radioGroup: { name, selectedValue, onChange }
  }
  const Component = props.Component || 'div'
  return (
    <MyContext.Provider value={val}>
      <Component role="radiogroup" {...rest}>{children}</Component>
    </MyContext.Provider>
  )
}

export { 
  RadioGroup,
  Radio
}