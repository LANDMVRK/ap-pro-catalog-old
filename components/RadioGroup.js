// Основа - https://github.com/chenglou/react-radio-group

import React from 'react'
import { Form } from 'react-bootstrap'

const MyContext = React.createContext()

function Radio(props) {
  return (
    <MyContext.Consumer>
      {function(value) {
        const { name, selectedValue, onChange } = value
        const optional = {}
        if (selectedValue !== undefined) {
          optional.checked = (props.value === selectedValue)
        }
        if (typeof onChange === 'function') {
          optional.onChange = onChange.bind(null, props.value)
        }
        return (
          <Form.Check 
            type="radio"
            id={name + props.value}
            label={props.label}
            {...props}
            role="radio"
            aria-checked={optional.checked}
            // name={name}
            {...optional}
          />
        )
      }}
    </MyContext.Consumer>
  )
}

function RadioGroup(props) {
  const { name, selectedValue, onChange, children, ...rest} = props
  const Component = props.Component || 'div'
  return (
    <MyContext.Provider value={{ name, selectedValue, onChange }}>
      <Component role="radiogroup" {...rest}>{children}</Component>
    </MyContext.Provider>
  )
}

export { 
  RadioGroup,
  Radio
}