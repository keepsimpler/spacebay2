import React from 'react'
import LegacyModalWrapper from "../LegacyModalWrapper";
import ContextualLogin from "../context-wrappers/ContextualLogin";
import PropTypes from 'prop-types'

const LoginModalWrapper = (props) => {
    const { stack, closeModal } = props

    return (
        <LegacyModalWrapper
            component={ContextualLogin}
            path="login"
            stack={stack}
            closeModal={closeModal}
            props={{
                ...props,
                cancel: () => closeModal()
            }}
        />
    )
}

LoginModalWrapper.propTypes = {
    closeModal: PropTypes.func.isRequired,
    handleForgotPasswordNavigation: PropTypes.func.isRequired,
    handleSignUpNavigation: PropTypes.func.isRequired,
    stack: PropTypes.number,
    thirdPartyId: PropTypes.string
}

LoginModalWrapper.defaultProps = {
    stack: 1,
    closeModal: () => {}
}


export default LoginModalWrapper
