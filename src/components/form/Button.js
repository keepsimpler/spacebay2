import React from 'react'
import classNames from 'classnames'
import commonButtonPropTypes from './util/button-prop-types'

import 'css/button.css'

const Button = (props) => {
  const {
    label,
    onClick,
    disabled = false,
    className,
    ...rest
  } = props

  const internalOnClick = () => {
    if(!disabled) {
      onClick()
    }
  }

  return (
    <div className={classNames("button", className, {"disabled-button": disabled })}
         onClick={internalOnClick}
         {...rest}>
      { label }
    </div>
  )
}

Button.propTypes = commonButtonPropTypes

export default Button

