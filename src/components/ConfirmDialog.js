import React, {Component} from 'react';
import {Modal} from 'react-router-modal';
import 'react-router-modal/css/react-router-modal.css';
import '../css/components/alert.css';


class ConfirmDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showAlert: false
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({
            title: this.props.title ? this.props.title : false,
            showAlert: this.props.showAlert
        })
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.showAlert) {
            this.setState({showAlert: newProps.showAlert});
            this.setState({title: newProps.title});
        }
    }

    acceptMyAlert = () => {
        this.setState({showAlert: false});
        this.props.onClose();
        this.props.proceedEventHandler();
    };

    closeMyAlert = () => {
        this.setState({showAlert: false});
        this.props.onClose();
    };

    render() {
        return (

            <div>
                {this.state.showAlert ?
                    <Modal
                        className={this.state.showAlert ? 'modal-form alert-message' : 'hidden'}
                        onBackdropClick={this.closeMyAlert}>
                        <div>
                            <div className="modal-content">
                                <div className={this.state.title ? 'modal-header d-flex' : 'hidden'}>
                                    <h5 className="modal-title">{this.state.title}</h5>
                                    <button type="button" className="close"
                                            aria-label="Close"
                                            onClick={this.closeMyAlert}>
                                        <img alt="" width="20"
                                             src="../app-images/close.png"/>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {this.props.children}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="ss-button-primary-modal-form"
                                            onClick={this.acceptMyAlert}>Ok
                                    </button>
                                    <button type="button" className="ss-button-primary-modal-form reverse"
                                            onClick={this.closeMyAlert}>Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                    :
                    null
                }
            </div>
        )
    }
}

export default ConfirmDialog;

