import React, {Component} from 'react';
import {Modal} from 'react-router-modal';
import 'react-router-modal/css/react-router-modal.css';
import '../css/components/alert.css';

const $ = window.$;

class ModalForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showForm: false,
            errorMessage: this.props.errorMessage ? this.props.errorMessage : null,
        };
    }

    UNSAFE_componentWillMount() {
        let emptyEquipment = {
            name: '',
            pricePerDay: 0,
            pricePerWeek: 0,
            pricePerMonth: 0
        };

        this.setState({
            title: this.props.title ? this.props.title : false,
            currentEquipment: this.props.currentEquipment ? this.props.currentEquipment : emptyEquipment,
            errorMessage: this.props.errorMessage ? this.props.errorMessage : null,
            showForm: this.props.showForm
        })
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (this.props.showForm !== newProps.showForm) {
            if (newProps.showForm) {
                this.setState({
                    showForm: newProps.showForm,
                    title: newProps.title
                });
                $("body").addClass("no-scroll");
            } else {
                $("body").removeClass("no-scroll");
            }
        }
        if (newProps.currentEquipment) {
            this.setState({currentEquipment: newProps.currentEquipment});
        }
        if (typeof newProps.errorMessage !== 'undefined') {
            this.setState({errorMessage: newProps.errorMessage});
        }
    }

    acceptMyForm = () => {
        let shouldLeaveOpen = this.props.proceedEventHandler();
        if (!shouldLeaveOpen) {
            this.setState({showForm: false});
            this.props.onClose('save');
        }
    };

    closeMyForm = () => {
        this.setState({showForm: false});
        this.props.onClose();
    };

    render() {
        return (
            <div>
                {this.state.showForm ?
                    <Modal
                        className={this.state.showForm ? 'modal-form alert-message '+(this.props.size?this.props.size : '' ) : 'hidden'}
                        onBackdropClick={this.closeMyForm}>
                        <div >
                            <div className="modal-content">
                                <div className={this.state.title ? 'modal-header d-flex' : 'hidden'}>
                                    <h5 className="modal-title">{this.state.title}</h5>

                                    <button type="button" className="close"
                                            aria-label="Close"
                                            onClick={this.closeMyForm}>
                                        <img alt="" width="20"
                                             src="../app-images/close.png"/>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {this.props.children}
                                </div>
                                <div className="modal-footer">
                                        <button type="button" className={'ss-button-primary-modal-form '+(this.props.textAlign ? this.props.textAlign  : '') }
                                                disabled={this.state.errorMessage}
                                                onClick={this.acceptMyForm}>{this.props.textOk? this.props.textOk : 'Save'}
                                        </button>
                                        <button type="button" className="ss-button-primary-modal-form reverse"
                                                onClick={this.closeMyForm}>Cancel
                                        </button>
                                </div>
                            </div>
                        </div>
                    </Modal>
                    : ''
                }
            </div>
        )
    }
}

export default ModalForm;

