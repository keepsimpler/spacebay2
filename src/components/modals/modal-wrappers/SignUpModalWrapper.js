import React from 'react'
import LegacyModalWrapper from "../LegacyModalWrapper";
import ContextualSignUp from "../context-wrappers/ContextualSignUp";
import PropTypes from 'prop-types'

const SignUpModalWrapper = (props) => {

    const { stack, closeModal } = props

    return (
        <LegacyModalWrapper
            component={ContextualSignUp}
            path="/signup"
            stack={stack}
            closeModal={closeModal}
            props={{
                ...props,
                cancel: () => closeModal()
            }}
        />
    )
}

SignUpModalWrapper.propTypes = {
    handleNavigateToLogin: PropTypes.func.isRequired,
    handleNavigateToSignup: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    stack: PropTypes.number,
    thirdPartyId: PropTypes.string
}

SignUpModalWrapper.defaultProps = {
    stack: 1,
    closeModal: () => {}
}

export default SignUpModalWrapper
