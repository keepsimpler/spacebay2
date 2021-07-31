import React, { Component } from 'react'
import Modal from 'react-modal'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import 'css/secur-space-modal.css'

export default class SecurSpaceModal extends Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);

        Modal.setAppElement('#root')
    }


    render() {
        const { isOpen, className, overlayClassName } = this.props
        return (
            <Modal isOpen={isOpen}
                   className={classNames("secur-space-modal", { [className] : className })}
                   overlayClassName={classNames("secur-space-modal-overlay", { [overlayClassName] : overlayClassName })} >
                {this.props.children}
            </Modal>
        )
    }
}
