import React from 'react'
import LegacyModalWrapper from "../LegacyModalWrapper";
import ForgotPassword from "../../../views/ForgotPassword";
import PropTypes from 'prop-types'

const ForgotPasswordModalWrapper = (props) => {
    const { stack, closeModal } = props

    return (
        <LegacyModalWrapper
            component={ForgotPassword}
            path="forgot-password"
            stack={stack}
            closeModal={closeModal}
            props={{
                ...props,
                cancel: () => closeModal()
            }}
        />
    )
}

ForgotPasswordModalWrapper.propTypes = {
    closeModal: PropTypes.func.isRequired,
    stack: PropTypes.number
}

ForgotPasswordModalWrapper.defaultProps = {
    stack: 1,
    closeModal: () => {}
}

export default ForgotPasswordModalWrapper
