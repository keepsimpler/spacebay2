import React, {Component} from 'react';
import 'react-router-modal/css/react-router-modal.css';
import 'css/components/alert.css';


class ConfirmDialogBlock extends Component {
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
                    <div className="dialog-block app-modal">
                        <div className="modal-content">
                            <div className={this.state.title ? 'modal-header d-flex' : 'hidden'}>
                                <h3 className="modal-title">{this.state.title}</h3>
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
                                <button type="button" className="ss-button-primary-modal-form pull-left"
                                        onClick={this.acceptMyAlert}>Yes
                                </button>
                                <button type="button" className="ss-button-primary-modal-form reverse pull-right"
                                        onClick={this.closeMyAlert}>No
                                </button>
                            </div>
                        </div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

export default ConfirmDialogBlock;

