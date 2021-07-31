import React from 'react'
import Button from "./Button";
import classNames from 'classnames'
import commonButtonPropTypes from './util/button-prop-types'

const OutlinedButton = (props) => {
  const { className, ...rest } = props
  return <Button className={classNames("ss-button-secondary", className)} { ...rest } />
}

OutlinedButton.propTypes = commonButtonPropTypes

export default OutlinedButton
