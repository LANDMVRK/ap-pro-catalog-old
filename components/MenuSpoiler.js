// TO-DO https://react-bootstrap.github.io/utilities/transitions/

import { useState } from 'react'

import { Collapse } from 'react-bootstrap'

function MenuSpoiler(props) {
  const [open, setOpen] = useState(true)

  function toggleOpen() {
    setOpen(function(prevState) {
      return !prevState
    })
  }

  return (
    <>
      <div onClick={toggleOpen} className="page__sidebar-flex-govno">
        <div>{props.title}</div>
        {/* https://fontawesome.com/v5.15/icons/chevron-up?style=solid */}
        <svg style={{transform: open ? null : 'rotate(180deg)'}} className="page__sidebar-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z" class="" />
        </svg>
      </div>
      <Collapse in={open}>
        {props.children}
      </Collapse>
    </>
  )
}

export default MenuSpoiler