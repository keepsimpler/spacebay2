import React from 'react'
import DynamicPage from "../../../views/DynamicPage";
import PropTypes from 'prop-types'

const ContextualDynamicPage = (props) => {
    return <DynamicPage
        {...props}
    />
}

ContextualDynamicPage.propTypes = {
    cancel: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired
}

ContextualDynamicPage.defaultProps = {
    cancel: () => {},
    type: 'terms'
}

export default ContextualDynamicPage
