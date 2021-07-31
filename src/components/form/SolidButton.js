import React from 'react'
import Button from "./Button";
import classNames from 'classnames'
import commonButtonPropTypes from './util/button-prop-types'

const SolidButton = (props) => {
  const { className, ...rest } = props
  return <Button className={classNames("ss-button-primary", className)} { ...rest } />
}

SolidButton.propTypes = commonButtonPropTypes

export default SolidButton
