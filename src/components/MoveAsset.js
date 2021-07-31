import React, {Component} from 'react';
import Error from "./Error";
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "./Busy";


const $ = window.$;

export default class MoveAsset extends Component {
    constructor(props) {
        super(props);

        this.state = {
            orderNumber: '',
        };
    }

    handleFieldChange = event => {
        this.setState({[event.target.name]: event.target.value.toUpperCase()});
    };

    saveChanges = () => {

        this.setState({errorMessage: ''});

        $.ajax({
            url: `api/booking/orders/${this.state.orderNumber}`,
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                if (data) {
                    Busy.set(false);
                    this.completeSave();
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (error) => {
                Busy.set(false);
                this.setState({
                    errorMessage: "The booking entered is invalid."
                });
                return;
            }
        });

    };

    completeSave = () => {

        Busy.set(true);

        $.ajax({
            url: 'api/inventory-move',
            data: JSON.stringify({
                inventoryActivityId: this.props.moveItem.id,
                orderNumber: this.state.orderNumber,
            }),
            type: 'PUT',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                if (data) {
                    Busy.set(false);
                    this.props.handlePostSaveEvent();
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (error) => {
                Busy.set(false);
            }
        });


    };


    render() {

        return (
            <div>
                <form className="ss-form ss-block">
                    <div>
                        <div className="modal-body">
                            <fieldset className="ss-stand-alone">
                                <label htmlFor="orderNumber">BOOKING NUMBER</label>
                                <input type="text"
                                       id="orderNumber"
                                       name="orderNumber"
                                       value={this.state.orderNumber}
                                       onChange={this.handleFieldChange}
                                       placeholder="Enter the order number"
                                />
                            </fieldset>

                            {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}
                        </div>
                        <div className="modal-footer">
                            <div className="table text-center">
                                <button type="button" className="ss-button-secondary" onClick={() => this.saveChanges()}>
                                    Save Changes
                                </button>
                                <button type="button" className="ss-button-primary"
                                        onClick={() => this.props.handlePanelCloseEvent()}>Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        )

    }
}