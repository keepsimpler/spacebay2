import React, {Component} from 'react';
import '../css/components/bookingListItem.css';

const $ = window.$;

class BookingListItem extends Component {
    constructor(props) {
        super(props);

        this.itemImage = "https://s3-us-west-1.amazonaws.com/securspace-files/" +
            (props.booking.locationListingImageFileName ? "listing-images/" + encodeURIComponent(props.booking.locationListingImageFileName)
                : "app-images/Sorry-image-not-available.png");
    }

    extractValue = field => {
        let myValue = "";
        if (field[0]) {
            myValue = this.props.booking;
            for (var i = 0; i < field.length; i++) {
                myValue = myValue ? myValue[field[i]] : '';
            }
        }
        return myValue ? myValue : '-';
    };

    getStatusClass(status) {
        if (status === 'Approved' || status === 'Approved-Adjusted' || status === 'Active' || status === 'Active-Adjusted' ||
            status === 'Completed' || status === 'Completed-Adjusted') {
            return 'ss-bookings ss-success-box';
        } else if (status === 'Processing-ACH-Payment' || status === 'Processing-ACH-Payment-Adjusted' ||
            status === 'Processing-ACH-Refund-Adjusted' || status === 'Pending') {
            return 'ss-bookings ss-warning-box';
        } else {
            return 'ss-bookings ss-danger-box';
        }
    }

    extractField = item => {
        if (typeof item.valueF !== 'undefined') {
            let valueF = item.valueF(this.props.booking);
            return valueF ? valueF : '-';
        } else {
            let field = item.field.split("."),
                myValue = this.extractValue(field),
                myValue2 = "";

            if (typeof item.field2 !== 'undefined') {
                let field = item.field2.split(".");
                myValue2 = this.extractValue(field);
                if (myValue2 === '12/31/2200') {
                    myValue2 = '<span style="line-height: .1;position: relative;font-size: 12px">Until cancelled</span>';
                }
            }
            return myValue + (myValue2 ? ' &rarr; ' + myValue2 : '');
        }
    };

    applyLabel = item => {
        if (typeof item.label === 'string') {
            return item.label;
        } else if (typeof item.label === 'function') {
            return item.label(this.props.booking);
        } else return 'invalid!!!';
    };

    applyClass = item => {
        let myValue = this.extractField(item);
        return (this[item.class + ''](myValue));
    };

    createContent = () => {
        let content = "";
        let startColumn = 0;
        for (let i = 0; i < this.props.labels.length; i++) {
            let item = this.props.labels[i];
            if (i === 0 || startColumn === 0) {
                content += "<div>";
            }
            let label = this.applyLabel(item);

            if (typeof item.class !== 'undefined') {
                content += label ? ("<fieldset>" +
                    "<label>" + label + ": </label>" +
                    "<div class='" + this.applyClass(item) + "'>" + this.extractField(item) + "</div>" +
                    "</fieldset>") : "";
            } else {

                content += label ? ("<fieldset>" +
                    "<label>" + label + ": </label>" +
                    "<div>" + this.extractField(item) + "</div>" +
                    "</fieldset>") : "";
            }

            startColumn++;
            //end column
            if (item.rows === 2 || startColumn === 2) {
                content += "</div>";
                startColumn = 0;
            }

        }
        return content;

    };

    createContentStep = flag => {
        let content = "";
        let startColumn = 0;

        for (let i = ((flag === 2) ? 2 : 0); i < this.props.labels.length && (flag === 1 ? (i < 2) : true); i++) {
            let item = this.props.labels[i];
            if (i === 0 || startColumn === 0) {
                content += "<div>";
            }
            let label = this.applyLabel(item);

            if (typeof item.class !== 'undefined') {
                content += label ? ("<fieldset>" +
                    "<label>" + label + ": </label>" +
                    "<div class='" + this.applyClass(item) + "'>" + this.extractField(item) + "</div>" +
                    "</fieldset>") : "";
            } else if (item.label === 'Address') {
                const {booking} = this.props
                if (['Approved', 'Approved-Adjusted', 'Processing-ACH-Payment', 'Manual-Payment'].includes(booking.status) && booking.active) {
                    content += "<fieldset>"
                        + "<label>" + item.label + "</label>"
                        + "<div>"
                        + `<a href=${booking.mapsLocationAddress} target="_blank">${booking.locationAddressLine1} ${booking.locationCity} ${booking.locationState}</a>`
                        + "</div>"
                        + "</fieldset>"
                }
            } else if (item.label === 'Facility Instructions') {
                const {booking} = this.props
                if (['Approved', 'Approved-Adjusted', 'Processing-ACH-Payment', 'Manual-Payment'].includes(booking.status) && booking.active) {
                    content += "<fieldset>"
                        + `<label>${item.label}</label>`
                        + "<div>"
                        + `<div>${booking.locationInstructions ? booking.locationInstructions : ''}</div>`
                        + "</div>"
                }
            } else {
                content += label ? ("<fieldset>" +
                    "<label>" + label + ": </label>" +
                    "<div>" + this.extractField(item) + "</div>" +
                    "</fieldset>") : "";
            }

            startColumn++;
            //end column
            if (item.rows === 2 || startColumn === 2) {
                content += "</div>";
                startColumn = 0;
            }

        }
        return content;
    };

    getBuyerCompanyName = () => {
        return this.props.booking.buyerAccount ?
            this.props.booking.buyerAccount.companyName
            :
            this.props.booking.buyerCompanyName;
    };

    getSupplierCompanyName = () => {
        return this.props.booking.supplierAccount ?
            this.props.booking.supplierAccount.companyName
            :
            this.props.booking.supplierCompanyName;
    };

    getLocationName = () => {
        return this.props.booking.location ?
            this.props.booking.location.locationName
            :
            this.props.booking.locationName;
    };

    getSubscriptionStatus = () => {
        return this.props.booking.bookingSubscriptionStatus;
    };

    render() {
        let width = $(window).width();
        return (
            <div>
                {
                    (width > 999) ?
                        <div className="booking-list-item">
                            <div className="for-img">
                                <div style={{
                                    backgroundImage: "url(" + this.itemImage + ")"
                                }}>
                                </div>
                            </div>
                            <div className="for-content">
                                <div className="booking-list-title">
                                    <div>
                                        {
                                            this.props.account.type === 'Supplier' ?
                                                <span style={{width: "200px"}}>{this.getBuyerCompanyName()}</span>
                                                :
                                                <span
                                                    style={{width: "200px"}}>{this.getSupplierCompanyName()} - {this.getLocationName()}</span>
                                        }
                                        {
                                            this.props.booking.bookingSubscriptionStatus === 'ACTIVE' && this.props.booking.status === 'Pending' ?
                                                <div style={{color: "#F09019", fontWeight: "bold"}}>Subscription Pending
                                                    Approval</div>
                                                :
                                                this.props.booking.bookingSubscriptionStatus === 'DECLINED' ?
                                                    <div style={{color: "red", fontWeight: "bold"}}>Subscription
                                                        Declined</div>
                                                    :
                                                    this.props.booking.bookingSubscriptionStatus === 'ACTIVE' ?
                                                        <div style={{color: "#42C655", fontWeight: "bold"}}>Subscription
                                                            Active</div>
                                                        :
                                                        this.props.booking.bookingSubscriptionStatus === 'CANCELLED' ?
                                                            <div style={{color: "red", fontWeight: "bold"}}>Subscription
                                                                Cancelled</div>
                                                            :
                                                            ''
                                        }
                                    </div>
                                    <span>{this.props.children}</span>
                                </div>
                                <div>
                                    <div className="flex"
    dangerouslySetInnerHTML={{__html: this.createContentStep()}}/>
                                </div>
                            </div>
                        </div>
                        :
                        <div className="booking-list-item">
                            <div className="row1 flex">
                                <div className="for-img">
                                    <div style={{
                                        backgroundImage: "url(" + this.itemImage + ")"
                                    }}>
                                    </div>
                                </div>
                                <div className="booking-list-title">
                                    {
                                        this.props.account.type === 'Supplier' ?
                                            <span>{this.getBuyerCompanyName()}<br/>{this.getLocationName()}</span>
                                            :
                                            <span>{this.getSupplierCompanyName()}<br/>{this.getLocationName()}</span>
                                    }
                                    <div className="for-content">
                                        <div>
                                            <div className="flex"
                                                 dangerouslySetInnerHTML={{__html: this.createContentStep(1)}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row2 flex" dangerouslySetInnerHTML={{__html: this.createContentStep(2)}}>

                            </div>
                            {this.props.children}
                        </div>
                }
            </div>
        )

    }
}

export default BookingListItem;
