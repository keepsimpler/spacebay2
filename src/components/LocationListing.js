import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {createLogoutOnFailureHandler} from '../util/LogoutUtil'
import PaymentUtils from '../util/PaymentUtils'
import BooleanUtils from '../util/BooleanUtils'
import '../css/components/locationListing.css';
import '../css/theme/buttons.css';
import Busy from "./Busy";
import ConfirmDialog from "./ConfirmDialog";

const $ = window.$;

class LocationListing extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteConfirmation: false,
        };
    }

    handleLocationEditClick = () => {
        this.props.handleEditLocation(this.props.location);
        this.props.openEditModal()
    };

    startDeleteProcess = () => {
        Busy.set(false);
        this.setState({
            showDeleteConfirmation: true
        });
    };

    cancelDeleteProcess = () => {
        Busy.set(false);
        this.setState({
            showDeleteConfirmation: false
        });
    };

    deleteLocation = () => {
        Busy.set(true);
        $.ajax({
            url: 'api/location?locationId=' + this.props.location.id,
            type: 'DELETE',
            success: this.handleDeleteLocationSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleDeleteLocationFailure
        });
    };

    handleDeleteLocationSuccess = () => {
        Busy.set(false);
        this.setState({
            showDeleteConfirmation: false
        });
        this.props.handleDeleteLocationSuccess(this.props.location);
    };

    handleDeleteLocationFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({
            showDeleteConfirmation: false
        });
        this.props.handleDeleteLocationFailure(jqXHR.responseJSON ? jqXHR.responseJSON.message : "An error occurred while attempting to delete this location");
    };

    locationShowingInSearchResults() {
        return this.props.location.isVisible;
    }

    getNotVisibleInSearchResultReason() {
        if (!this.props.location.locationName || !this.props.location.pricePerDay ||
            !this.props.location.addressLine1 || !this.props.location.city || !this.props.location.state
            || !this.props.location.zip) {
            return "Missing Required Fields";
        } else if (!this.props.location.locationEquipmentTypes || (this.props.location.locationEquipmentTypes && this.props.location.locationEquipmentTypes.length === 0)) {
            return "No Equipment Types Selected";
        } else if (!this.props.location.locationFeatures || (this.props.location.locationFeatures && this.props.location.locationFeatures.length === 0)) {
            return "No Features Selected";
        } else if (!this.props.location.live) {
            return "Approval Required";
        }
    }

    render() {
        let width = $(window).width();
        return (
            <div className="ss-booking-container">
                <div>
                    {
                        (width > 999) ?
                            <div className="booking-list-item">
                                <div className="for-img">
                                    <div style={{
                                        backgroundImage: "url(https://s3-us-west-1.amazonaws.com/securspace-files/" +
                                        (this.props.location.listingImageFileName ? 'listing-images/' + encodeURIComponent(this.props.location.listingImageFileName)
                                            : 'app-images/Sorry-image-not-available.png') + ")",

                                    }}>
                                    </div>
                                </div>
                                <div className="for-content">
                                    <div className="booking-list-title">
                                        <span>{this.props.location.locationName}</span>
                                        <span>
                                     <div className="ss-booking-button-container">
                                         <button className="ss-button-danger" onClick={this.startDeleteProcess}>Delete
                                         </button>
                                         <button className="ss-button-primary" onClick={this.handleLocationEditClick}>
                                             Edit
                                         </button>
                                     </div>

                                          </span>

                                        <ConfirmDialog showAlert={this.state.showDeleteConfirmation}
                                                       title="Delete Location"
                                                       onClose={this.cancelDeleteProcess}
                                                       proceedEventHandler={this.deleteLocation}>
                                            Are you sure you want to delete this location?
                                        </ConfirmDialog>

                                    </div>
                                    <div>
                                        <div className="flex">
                                            <div>
                                                <fieldset>
                                                    <div
                                                        className="bg-icon icon-address">{this.props.location.addressLine1}
                                                        <br/>
                                                        {
                                                            this.props.location.city && this.props.location.state && this.props.location.zip ?
                                                                this.props.location.city + ", " + this.props.location.state + " " + this.props.location.zip
                                                                :
                                                                ""
                                                        }
                                                    </div>
                                                </fieldset>
                                            </div>

                                            <div>
                                                <fieldset>
                                                    <div
                                                        className="bg-icon icon-phone">{this.props.location.phoneNumber}</div>
                                                </fieldset>
                                            </div>

                                            <div>
                                                <fieldset>
                                                    <label>Search Status:</label>
                                                    <div>
                                                        {
                                                            this.locationShowingInSearchResults() ?
                                                                <div>
                                                <span className="green">
                                                    <i className="fa fa-check"></i> Visible
                                                </span>
                                                                    <br/>
                                                                    <span><Link to={{
                                                                        pathname: '/search',
                                                                        search: '?initLat=' + this.props.location.addressLatitude + '&initLng=' + this.props.location.addressLongitude + '&selectedSupplier=' + this.props.location.id
                                                                    }}>View</Link>
                                                    </span>
                                                                </div>
                                                                :
                                                                <div>
                                                    <span className="grey">
                                                        <i className='fa fa-close'></i>NOT VISIBLE</span>
                                                                    <br/>
                                                                    <span> {this.getNotVisibleInSearchResultReason()}</span>
                                                                </div>
                                                        }
                                                    </div>
                                                </fieldset>
                                            </div>

                                            <div>
                                                <fieldset>
                                                    <label>number of spaces:</label>
                                                    <div>{this.props.location.managedSpaces}</div>
                                                </fieldset>
                                            </div>

                                            <div>
                                                <fieldset>
                                                    <label>Per Day:</label>
                                                    <div>
                                                        {
                                                            this.props.location.pricePerDay ?
                                                                '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.pricePerDay, PaymentUtils.CURRENCY_US_DOLLAR)
                                                                :
                                                                ""
                                                        }
                                                    </div>
                                                </fieldset>
                                            </div>

                                            {this.props.account.userType === 'ADMIN' ?
                                                <div>
                                                    <fieldset>
                                                        <label>Per Week:</label>
                                                        <div>{
                                                            this.props.location.pricePerWeek ?
                                                                '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.pricePerWeek, PaymentUtils.CURRENCY_US_DOLLAR)
                                                                :
                                                                ""
                                                        }</div>
                                                    </fieldset>
                                                </div>
                                                : ''}

                                            <div>
                                                <fieldset>
                                                    <label>Per Month:</label>
                                                    <div>{
                                                        this.props.location.pricePerMonth ?
                                                            '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.pricePerMonth, PaymentUtils.CURRENCY_US_DOLLAR)
                                                            :
                                                            ""
                                                    }</div>
                                                </fieldset>
                                            </div>

                                            <div>
                                                <fieldset>
                                                    <label>Overage Rate:</label>
                                                    <div>{
                                                        this.props.location.overageRate ?
                                                            '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.overageRate, PaymentUtils.CURRENCY_US_DOLLAR)
                                                            :
                                                            ""
                                                    }</div>
                                                </fieldset>
                                            </div>

                                            <div>
                                                <fieldset>
                                                    <label>Automated Management:</label>
                                                    <div>{BooleanUtils.convertToYesNo(this.props.location.managedLocation)}</div>
                                                </fieldset>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>
                            :
                            <div className="booking-list-item">
                                <div className="row1 flex">
                                    <div className="for-img">
                                        <div style={{
                                            backgroundImage: "url(https://s3-us-west-1.amazonaws.com/securspace-files/" +
                                            (this.props.location.listingImageFileName ? 'listing-images/' + encodeURIComponent(this.props.location.listingImageFileName)
                                                : 'app-images/Sorry-image-not-available.png') + ")",

                                        }}>
                                        </div>
                                    </div>
                                    <div className="booking-list-title">
                                        <span>{this.props.location.locationName}</span>
                                        <div className="for-content">
                                            <div>
                                                <div className="flex">
                                                    <div>
                                                        <fieldset>
                                                            <div
                                                                className="bg-icon icon-address">{this.props.location.addressLine1}
                                                                <br/>
                                                                {
                                                                    this.props.location.city && this.props.location.state && this.props.location.zip ?
                                                                        this.props.location.city + ", " + this.props.location.state + " " + this.props.location.zip
                                                                        :
                                                                        ""
                                                                }
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                    <div>
                                                        <fieldset>
                                                            <div
                                                                className="bg-icon icon-phone">{this.props.location.phoneNumber}</div>
                                                        </fieldset>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row2 flex">

                                    <div>
                                        <fieldset>
                                            <label>Search Status:</label>
                                            <div>
                                                {
                                                    this.locationShowingInSearchResults() ?
                                                        <div>
                                                <span className="green">
                                                    <i className="fa fa-check"></i> Visible
                                                </span>
                                                            <br/>
                                                            <span><Link to={{
                                                                pathname: '/search',
                                                                search: '?initLat=' + this.props.location.addressLatitude + '&initLng=' + this.props.location.addressLongitude + '&selectedSupplier=' + this.props.location.id
                                                            }}>View</Link>
                                                    </span>
                                                        </div>
                                                        :
                                                        <div>
                                                    <span className="grey">
                                                        <i className='fa fa-close'></i>NOT VISIBLE</span>
                                                            <br/>
                                                            <span> {this.getNotVisibleInSearchResultReason()}</span>
                                                        </div>
                                                }
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div>
                                        <fieldset>
                                            <label>number of spaces:</label>
                                            <div>{this.props.location.managedSpaces}</div>
                                        </fieldset>
                                    </div>
                                    <div>
                                        <fieldset>
                                            <label>Per Day:</label>
                                            <div>
                                                {
                                                    this.props.location.pricePerDay ?
                                                        '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.pricePerDay, PaymentUtils.CURRENCY_US_DOLLAR)
                                                        :
                                                        ""
                                                }
                                            </div>
                                        </fieldset>
                                    </div>

                                    {this.props.account.userType === 'ADMIN' ?
                                        <div>
                                            <fieldset>
                                                <label>Per Week:</label>
                                                <div>{
                                                    this.props.location.pricePerWeek ?
                                                        '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.pricePerWeek, PaymentUtils.CURRENCY_US_DOLLAR)
                                                        :
                                                        ""
                                                }</div>
                                            </fieldset>
                                        </div>
                                        : ''}

                                    <div>
                                        <fieldset>
                                            <label>Per Month:</label>
                                            <div>{
                                                this.props.location.pricePerMonth ?
                                                    '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.pricePerMonth, PaymentUtils.CURRENCY_US_DOLLAR)
                                                    :
                                                    ""
                                            }</div>
                                        </fieldset>
                                    </div>

                                    <div>
                                        <fieldset>
                                            <label>Overage Rate:</label>
                                            <div>{
                                                this.props.location.overageRate ?
                                                    '$' + PaymentUtils.convertSmallestSubUnitToMainUnit(this.props.location.overageRate, PaymentUtils.CURRENCY_US_DOLLAR)
                                                    :
                                                    ""
                                            }</div>
                                        </fieldset>
                                    </div>

                                    <div>
                                        <fieldset>
                                            <label>Automated Management:</label>
                                            <div>{BooleanUtils.convertToYesNo(this.props.location.managedLocation)}</div>
                                        </fieldset>
                                    </div>
                                </div>
                                <div>
                                    <div className="ss-booking-button-container">
                                        <button className="ss-button-danger" onClick={this.startDeleteProcess}>
                                            Delete
                                        </button>
                                        <button className="ss-button-primary"
                                                onClick={this.handleLocationEditClick}>
                                            Edit
                                        </button>
                                    </div>

                                    <ConfirmDialog showAlert={this.state.showDeleteConfirmation}
                                                   title="Delete Location"
                                                   onClose={this.cancelDeleteProcess}
                                                   proceedEventHandler={this.deleteLocation}>
                                        Are you sure you want to delete this location?
                                    </ConfirmDialog>

                                </div>

                            </div>

                    }


                </div>
            </div>
        )
    }
}

export default LocationListing;
