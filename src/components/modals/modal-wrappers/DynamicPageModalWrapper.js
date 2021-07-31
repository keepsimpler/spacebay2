import React from 'react'
import LegacyModalWrapper from "../LegacyModalWrapper";
import ContextualDynamicPage from "../context-wrappers/ContextualDynamicPage";
import PropTypes from 'prop-types'

const DynamicPageModalWrapper = (props) => {
    const { stack, closeModal } = props

    return (
        <LegacyModalWrapper
            className="app-modal modal-page"
            component={ContextualDynamicPage}
            stack={stack}
            closeModal={closeModal}
            props={{
                ...props,
                cancel: () => closeModal()
            }}
        />
    )
}

DynamicPageModalWrapper.propTypes = {
    closeModal: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    stack: PropTypes.number
}

DynamicPageModalWrapper.defaultProps = {
    closeModal: () => {},
    type: 'terms',
    stack: 1
}

export default DynamicPageModalWrapper
