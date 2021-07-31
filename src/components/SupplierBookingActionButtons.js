import React, {Component} from 'react';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';

class SupplierBookingActionButtons extends Component {

    static showCancel(account, booking) {
        const ONE_HOUR = 60 * 60 * 1000;
        const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
        let timeBeforeBookingStart = new Date(booking.startDate) - (new Date());
        return (timeBeforeBookingStart > TWENTY_FOUR_HOURS && ['OWNER', 'GATEMANAGER'].includes(account.userType));
    }

    render () {
        return (
            <div className="ss-booking-button-container">
                <button className="ss-button-primary"
                        onClick={() => this.props.changeViewHandler('check-in-out-head', this.props.booking)}>
                    Check - In</button>
                {
                    SupplierBookingActionButtons.showCancel(this.props.account, this.props.booking) ?
                        <button className="ss-button-danger"
                                onClick={() => this.props.cancelBooking(this.props.booking.id)}
                        >Cancel</button>
                        :
                        ''
                }
            </div>
        )
    }
}

export default SupplierBookingActionButtons;