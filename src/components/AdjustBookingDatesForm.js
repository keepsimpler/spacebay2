import React, {Component} from 'react';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "./Busy";
import {toast} from 'react-toastify';
import DatePicker from "./DatePicker";

const $ = window.$;

class AdjustBookingDatesForm extends Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({
            startDate: this.props.booking.startDate,
            endDate: this.props.booking.endDate
        });
    }

    handleFieldChange = event => {
        let name = event.target.name;
        let value = event.target.value;

        this.setState({[name]: value});
    };

    submitForm = () => {
        Busy.set(true);

        $.ajax({
            url: 'api/booking/adjust-dates',
            data: JSON.stringify({
                bookingId: this.props.booking.id,
                startDate: this.state.startDate,
                endDate: this.state.endDate
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (booking) => {
                Busy.set(false);
                this.props.onSuccess(booking);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: (jqXHR) => {
                Busy.set(false);
                let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message ? jqXHR.responseJSON.message.trim() : "" : "";
                toast.error("Failed to adjust dates:  " + errorMessage);
            }
        });
    };

    render() {

        return (
            <div>
                <h3 className={'ss-summary' + (this.props.display === 'popup') ? 'hidden' : ''}>
                    Adjust Booking Dates
                </h3>
                <form className="no-padding">
                    <div className="modal-body">

                        <p className="ss-summary"></p>
                        <p className="ss-adjust-dates-details ss-details">If
                            the
                            actual drop-off or pickup occurs earlier or
                            later than the
                            Booking Dates, you can correct them here. This
                            will adjust
                            the
                            charge to the Customer.
                        </p>
                        <br/>
                        <div className="ss-fieldset-row for-hs-field">
                            <div id="searchStartDateItem" className="hs-field">
                                <label>FROM</label>
                                <DatePicker id="startDate"
                                            name="startDate"
                                            value={this.state.startDate}
                                            onChange={this.handleFieldChange}
                                            width="100px"
                                />
                            </div>

                            <div id="searchEndDateItem"
                                 className="hs-field">
                                <label
                                    className="ss-inline-end-date-label">UNTIL</label>
                                <DatePicker id="endDate"
                                            name="endDate"
                                            value={this.state.endDate}
                                            onChange={this.handleFieldChange}
                                            width="100px"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <div className="table text-center">
                            <button type="button"
                                    className="ss-button-primary"
                                    onClick={() => this.submitForm()}>
                                Adjust Dates
                            </button>
                            <button type="button" className="ss-button-primary"
                                    onClick={() => this.props.closeSubViewHandler()}>Cancel
                            </button>
                        </div>
                    </div>


                </form>
            </div>
        );


    }
}

export default AdjustBookingDatesForm;