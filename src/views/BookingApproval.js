import React, {Component} from 'react';
import {formatCurrencyValue} from '../util/PaymentUtils';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
// import '../css/components/approvals.css';
import DateArrow from "../components/DateArrow";
import StatusBadge from "../components/StatusBadge";
import Busy from "../components/Busy";
import ErrorAlert from "../components/ErrorAlert";
import URLUtils from "../util/URLUtils";
import Error from "../components/Error";
import {BookingReasonDeclined} from "../components/constants/securspace-constants";

const $ = window.$;

class BookingApproval extends Component {
    constructor(props) {
        super(props);

        let token = URLUtils.getQueryVariable('token');
        if (!token) {
            token = '';
        }
        let action = URLUtils.getQueryVariable('action');
        if (!action) {
            action = '';
        }
        this.state = {
            data: null,
            token: token,
            action: action,
            errorMessage: '',
            title: ''
        };

        if (!action) {
            this.getBooking(this.state.token);
        } else {
            this.updateBookingStatusByToken(this.state.token, this.state.action);
        }
    }

    getBooking = token => {
        if (token) {
            Busy.set(true);
            $.ajax({
                url: 'api/booking/get-by-token?token=' + token,
                type: 'GET',
                success: (data) => {
                    Busy.set(false);
                    if (data) {
                        this.setState({data: data});
                        this.setState({title: "Your Booking"});
                    } else {
                        this.setState({title: "Expired token"});
                    }

                },
                error: this.bookingsFailedToLoad
            });
        }
    };

    bookingsFailedToLoad = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({title: jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error"});
    };

    approveBooking = bookingId => {
        this.updateBookingStatus(bookingId, 'Approved', null);
    };

    declineBooking = (bookingId, reason) => {
        this.updateBookingStatus(bookingId, 'Declined', reason);
    };

    updateBookingStatusByToken = (token, status) => {
        Busy.set(true);
        this.setState({
            errorMessage: '',
        });
        $.ajax({
            url: 'api/booking/get-by-token?token=' + this.state.token,
            data: JSON.stringify({
                status: status,
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (res) => {
                Busy.set(false);
                if (res) {
                    let data = this.state.data ? this.state.data : {};
                    data.booking = res;
                    this.setState({data: data});
                }
                this.setState({title: "Successfully " +(status === 'approve') ?  "Approved" : "Declined"});
            },
            error: this.bookingsFailedToLoad
        });
    };

    updateBookingStatus(bookingId, status, reason) {
        Busy.set(true);
        this.setState({
            errorMessage: '',
        });
        $.ajax({
            url: 'api/booking/get-by-token?token=' + this.state.token,
            data: JSON.stringify({
                status: (status === 'Approved' ? 'approve' : 'decline'),
                reasonDeclined: reason
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (res) => {
                Busy.set(false);
                if (res) {
                    let data = this.state.data ? this.state.data : {};
                    data.booking = res;
                    this.setState({data: data});
                }
                this.setState({title: "Successfully " +status ?  status : "operation"});
            },
            error: this.handleFailure
        });
    }


    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);

        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;

        if ('You must accept the Terms of Service for ACH at stripe.com/docs/guides/ach before using US bank accounts as sources.' === errorMessage) {
            this.setState({
                errorMessage: '',
            });
        } else {
            this.setState({
                errorMessage: "Failed to update Booking:"
            });
        }
    };

    render() {
        return (
            <div id="ssApprovals" className="ss-main ss-vertical ss-booking-list">
                <div className='ss-approvals-title text-center'>
                    <h1 className="page-title">{this.state.title}</h1>
                </div>
                <div className="container">

                    {
                        this.state.errorMessage ?
                            <div className="text-center">
                                <ErrorAlert>{this.state.errorMessage}</ErrorAlert>
                            </div>
                            :
                            ''
                    }
                    {this.state.data ?

                        <div id={this.state.data.booking.id} className="ss-booking-container">
                            <p className="ss-summary">{this.state.data.booking.location.locationName}</p>
                            <hr/>
                            <div className="ss-booking-details">
                                <div>
                                    <dl className="ss-booking-labels">
                                        <dt>Customer:</dt>
                                        <dt>Location:</dt>
                                        <dt>Booking Number:</dt>

                                        <dt>Booked Dates:</dt>
                                        <dt>Spaces Booked:</dt>
                                        <dt>Frequency:</dt>
                                    </dl>
                                    <dl className="ss-booking-values">
                                        <dd>{this.state.data.booking.buyerAccount.companyName}</dd>
                                        <dd>{this.state.data.booking.location.locationName}</dd>
                                        <dd>{this.state.data.booking.orderNumber}</dd>

                                        <dd>{this.state.data.booking.startDate}<DateArrow/>{this.state.data.booking.endDate}
                                        </dd>
                                        <dd>{this.state.data.booking.numberOfSpaces}</dd>
                                        <dd>{
                                            this.state.data.booking.frequency === 'RECURRING' && this.state.data.booking.durationType === 'WEEKLY' ?
                                                'Recurring - Weekly'
                                                :
                                                this.state.data.booking.frequency === 'RECURRING' && this.state.data.booking.durationType === 'MONTHLY' ?
                                                    'Recurring - Monthly'
                                                    :
                                                    'One-Time'

                                        }</dd>
                                    </dl>
                                </div>
                                <div>

                                    <dl className='ss-booking-values'>
                                        <dd>{this.state.data.booking.brokered ? "True" : "False"}</dd>
                                        {this.state.data.booking.brokered ? '' :
                                            <dd>{formatCurrencyValue(this.state.data.booking.rate)}
                                                {
                                                    this.state.data.booking.durationType === 'WEEKLY' ? ' /week' : this.state.data.booking.durationType === 'MONTHLY' ? ' /month' : ' /day'
                                                }
                                            </dd>
                                        }
                                        <dd>{formatCurrencyValue(this.state.data.booking.initialSupplierPayoutAmount)}</dd>
                                        {this.state.data.booking.frequency === 'RECURRING' ?
                                            <dd>{formatCurrencyValue(this.state.data.booking.recurringSupplierPayoutAmount)}</dd> : ''}
                                        {
                                            this.state.data.booking.brokeredSupplierOverageRatePaid ?
                                                <dd>{formatCurrencyValue(this.state.data.booking.brokeredSupplierOverageRatePaid)}</dd>
                                                :
                                                <dd>{formatCurrencyValue(this.state.data.booking.location.pricePerDay)}</dd>
                                        }

                                        <dd>{this.state.data.booking.assetType}</dd>
                                        <dd><StatusBadge>{this.state.data.booking.status}</StatusBadge></dd>
                                    </dl>
                                    {this.state.data.booking.numberOfSpaces <= this.state.data.booking.locationInventoryCount ?
                                        <Error>Booking at or above capacity!</Error> : ''}
                                </div>

                            </div>
                            <div className='ss-approvals-action-container'>
                                {
                                    this.state.data.booking.status === 'Pending' ?
                                        <div>
                                            <button className="ss-button-danger"
                                                    style={{height: '40px', width: '100px'}}
                                                    onClick={() => this.declineBooking(this.state.data.booking.id, BookingReasonDeclined.PARTNER_DECLINED)}>
                                                Decline
                                            </button>
                                            <button className="ss-button-primary"
                                                    style={{height: '40px', width: '100px'}}
                                                    onClick={() => this.approveBooking(this.state.data.booking.id)}>
                                                Approve
                                            </button>
                                        </div>
                                        :
                                        this.state.data.booking.status === 'Incomplete' ?
                                            <div>
                                                <button className="ss-button-danger"
                                                        style={{height: '40px', width: '100px'}}
                                                        onClick={() => this.declineBooking(this.state.data.booking.id, BookingReasonDeclined.PARTNER_DECLINED)}>
                                                    Decline
                                                </button>
                                            </div>
                                            :

                                            $.inArray(this.state.data.booking.status, ['Approved', 'Active', 'Complete']) >= 0 && this.state.data.booking.frequency !== 'RECURRING' ?
                                                <div>

                                                </div>
                                                :
                                                ''
                                }
                            </div>
                        </div>
                        : ''
                    }

                </div>
            </div>
        )
    }
}

export default BookingApproval;
