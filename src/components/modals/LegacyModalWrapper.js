import React, { Component } from "react"
import { withRouter } from "react-router"
import { Modal } from 'react-router-modal'
import { LogoType } from "../constants/securspace-constants";
import PropTypes from 'prop-types'

class LegacyModalWrapper extends Component {

    static propTypes = {
        path: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        className: PropTypes.string,
        inClassName: PropTypes.string,
        outClassName: PropTypes.string,
        backdropClassName: PropTypes.string,
        backdropInClassName: PropTypes.string,
        backdropOutClassName: PropTypes.string,
        props: PropTypes.object,
        onBackdropClick: PropTypes.func
    }

    static defaultProps = {
        className: "app-modal",
        inClassName: "app-modal-in",
        outClassName: "app-modal-out",
        backdropClassName: "app-backdrop",
        backdropInClassName: "app-backdrop-in",
        backdropOutClassName: "app-backdrop-out",
        logoType: LogoType.LOGO_TRANSPARENT
    }

    render() {
        const { props, closeModal, location, history, ...rest } = this.props
        const composedProps = {
            location,
            history,
            closeModal,
            handlePanelCloseEvent: () => closeModal(),
            ...props
        }
        return (
            <Modal
                props={composedProps}
                {...rest}
            />
        )
    }
}

export default withRouter(LegacyModalWrapper)
