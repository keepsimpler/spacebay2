import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {formatCurrencyValue} from "../util/PaymentUtils";
import "../css/components/supplierListImage.css";
import LocationFeatures from "../components/LocationFeatures";
import ReactTooltip from 'react-tooltip';

const $ = window.$;
const LOCATION_FEATURES = LocationFeatures.OPTIONS;
const LOCATION_ICONS =
    [
        "../app-images/security.png",
        "../app-images/gate.png",
        "../app-images/ycamera.png",
        "../app-images/gcamera.png",
        "../app-images/lights.png",
        "../app-images/paved.png",
        "../app-images/mr.png",
        "../app-images/pick.png",
        "../app-images/inventory.png",
        "../app-images/access.png",
        "../app-images/overnight_parking.png",
        "../app-images/restrooms_small.png"
    ];

class SupplierListImage extends Component {

    componentDidMount() {
        let element = ReactDOM.findDOMNode(this);
        if (this.props.isSelected) {
            $(element).trigger('click');
        }
    }

    render() {
        let image = "../app-images/no_image.png";
        if (this.props.supplier.listingImageFileName) {
            image = "https://s3-us-west-1.amazonaws.com/securspace-files/listing-images/" + encodeURIComponent(this.props.supplier.listingImageFileName);
        }
        return (

            <div
                className="ss-supplier-list-item selected-location"
                onClick={() => {
                    this.props.onSupplierClicked(this.props.supplier)
                }}>
                <div className="ss-supplier-list-image" style={{
                    backgroundImage: "url(" + image + ")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover"

                }}>
                </div>
                <div className="first-row flex">
                    <div
                        className={!this.props.supplier.visible ? "notlive" : this.props.supplier.hasRequestedCapacity ? "instant" : ""}>{!this.props.supplier.visible ? "Not Live" : this.props.supplier.hasRequestedCapacity ? "Instant Approval" : "Request Space"}
                    </div>
                    {
                        (!this.props.supplier.pricePerDay && this.props.supplier.pricePerMonth) || (this.props.recurringBooking && this.props.selectedFrequencyType && this.props.selectedFrequencyType.name === "Monthly") ?
                            <div className="ss-list-item-price-container">
                                <div
                                    className="ss-list-item-price-per-day">
                                    <strong>{this.props.supplier.pricePerMonth ? formatCurrencyValue(this.props.supplier.pricePerMonth) : "N/A"}&nbsp;</strong>
                                    {this.props.supplier.pricePerMonth ? "/month" : ""}
                                </div>
                            </div>
                            :
                            this.props.recurringBooking && this.props.selectedFrequencyType && this.props.selectedFrequencyType.name === "Weekly" ?
                                <div className="ss-list-item-price-container">
                                    <div
                                        className="ss-list-item-price-per-day">
                                        <strong>{this.props.supplier.pricePerWeek ? formatCurrencyValue(this.props.supplier.pricePerWeek) : "N/A"}&nbsp;</strong>
                                        {this.props.supplier.pricePerWeek ? "/week" : ""}
                                    </div>
                                </div>
                                :
                                <div className="ss-list-item-price-container">
                                    <div
                                        className="ss-list-item-price-per-day">
                                        <strong>{formatCurrencyValue(this.props.supplier.pricePerDay)}&nbsp;</strong>
                                        /day
                                    </div>
                                </div>
                    }
                </div>
                <div className="ss-list-item-features">
                    {
                        (this.props.supplier.features && this.props.supplier.features.length > 0) ?
                            this.props.supplier.features.map((item, index) =>
                                    <span key={this.props.supplier.id + '-' + index}>
                        <ReactTooltip id={this.props.supplier.id + '-imgss-' + index}
                                      type="success"
                                      effect="solid"
                                      place="right"
                                      className="tooltip-tip-hover">
                            {item}
                        </ReactTooltip>
                    <img data-tip alt={item} data-for={this.props.supplier.id + '-imgss-' + index}
                         src={LOCATION_ICONS[LOCATION_FEATURES.indexOf(item)]}/>
                        </span>
                            )
                            : null
                    }
                </div>
                <div className="ss-list-last-row">
                    <div className="ss-list-item-company-name">{this.props.supplier.locationName}</div>
                    <div
                        className="ss-list-item-location-name">{this.props.supplier.city}, {this.props.supplier.state} - {this.props.supplier.distance} mi</div>
                </div>
            </div>
        )

    }
}

export default SupplierListImage;
