import React, {Component} from 'react';
import '../css/views/companyProfile.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {createLogoutOnFailureHandler} from '../util/LogoutUtil';
import Busy from "../components/Busy";
import {createLocationFromAddress} from "../util/AddressUtil";
import MapStyle from "../components/MapStyle";
import ButtonSelector from "../components/ButtonSelector";
import Select from "../components/Select";
import {formatCurrencyValue, parseCurrencyValue, validateCurrencyValue} from "../util/PaymentUtils";
import {toast} from "react-toastify";
import DatePicker from "../components/DatePicker";
import LocationMap from "../components/LocationMap";

const $ = window.$;
const google = window.google;
let autocomplete;

let PAYOUT_SCHEDULE_TYPE_MANUAL = {
    name: "Manual",
    value: "MANUAL"
};
let PAYOUT_SCHEDULE_TYPE_DAILY = {
    name: "Daily",
    value: "DAILY"
};
let PAYOUT_SCHEDULE_TYPE_WEEKLY = {
    name: "Weekly",
    value: "WEEKLY"
};
let PAYOUT_SCHEDULE_TYPE_MONTHLY = {
    name: "Monthly",
    value: "MONTHLY"
};
let PAYOUT_SCHEDULE_TYPES = [
    PAYOUT_SCHEDULE_TYPE_MANUAL,
    PAYOUT_SCHEDULE_TYPE_DAILY,
    PAYOUT_SCHEDULE_TYPE_WEEKLY,
    PAYOUT_SCHEDULE_TYPE_MONTHLY
];

let PAYOUT_SCHEDULE_TYPES_BY_VALUE = {
    MANUAL: PAYOUT_SCHEDULE_TYPE_MANUAL,
    DAILY: PAYOUT_SCHEDULE_TYPE_DAILY,
    WEEKLY: PAYOUT_SCHEDULE_TYPE_WEEKLY,
    MONTHLY: PAYOUT_SCHEDULE_TYPE_MONTHLY
};

let DURATION_CHARGE_TYPE_24_HOUR = {
    name: "24 Hour",
    value: "TWENTY_FOUR_HOUR"
};
let DURATION_CHARGE_TYPE_CALENDAR_DAY = {
    name: "Calendar Day",
    value: "CALENDAR_DAY"
};

let DURATION_CHARGE_TYPES = [
    DURATION_CHARGE_TYPE_24_HOUR,
    DURATION_CHARGE_TYPE_CALENDAR_DAY
];

class CompanyDetails extends Component {
    constructor(props) {
        super(props);
        let mapData = {
            center: {
                lat: 37.090240,
                lng: -95.712891,
            },
            zoom: 4,
            markers: [],
        };

        let lookupLocation = createLocationFromAddress(this.props.account);
        let currentPayoutScheduleType = this.props.account && this.props.account.payoutSchedule ? PAYOUT_SCHEDULE_TYPES_BY_VALUE[this.props.account.payoutSchedule] : "";
        let currentDurationChargeType = this.props.account && this.props.account.useCalendarDays ? DURATION_CHARGE_TYPE_CALENDAR_DAY : DURATION_CHARGE_TYPE_24_HOUR;
        this.state = Object.assign(this.props.account, {
            lookupLocation: lookupLocation,
            oldListingImageFileName: this.props.account.listingImageFileName,
            oldSupplierLegalAgreementFileName: this.props.account.supplierLegalAgreementFileName,
            selectedPayoutScheduleType: currentPayoutScheduleType ? currentPayoutScheduleType : PAYOUT_SCHEDULE_TYPE_MANUAL,
            selectedDurationChargeType: currentDurationChargeType
        }, mapData);

        this.setAutocompleteFromAddress(lookupLocation);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.account !== nextProps.account) {
            let lookupLocation = createLocationFromAddress(nextProps.account);
            let currentPayoutScheduleType = nextProps.account && nextProps.account.payoutSchedule ? PAYOUT_SCHEDULE_TYPES_BY_VALUE[nextProps.account.payoutSchedule] : "";
            let currentDurationChargeType = nextProps.account && nextProps.account.useCalendarDays ? DURATION_CHARGE_TYPE_CALENDAR_DAY : DURATION_CHARGE_TYPE_24_HOUR;
            this.setState(Object.assign(this.state, nextProps.account, {
                lookupLocation: lookupLocation,
                oldListingImageFileName: nextProps.account.listingImageFileName,
                oldSupplierLegalAgreementFileName: nextProps.account.supplierLegalAgreementFileName,
                selectedPayoutScheduleType: currentPayoutScheduleType ? currentPayoutScheduleType : PAYOUT_SCHEDULE_TYPE_MANUAL,
                selectedDurationChargeType: currentDurationChargeType
            }));
            this.setAutocompleteFromAddress(lookupLocation);
        }
    }

    componentDidMount() {
        let _this = this;
        let lookupLocation = document.getElementById('lookupLocation');
        autocomplete = new window.google.maps.places.Autocomplete(lookupLocation);
        autocomplete.addListener('place_changed', function () {
            let place = autocomplete.getPlace();
            if (place.geometry) {

                let streetNumber = '';
                let route = '';
                let city = '';
                let state = '';
                let zip = '';

                let location = place.geometry.location;

                for (let i = 0; i < place.address_components.length; i++) {
                    let addressType = place.address_components[i].types[0];

                    if (addressType === 'street_number') {
                        streetNumber = place.address_components[i]['short_name'];
                    } else if (addressType === 'route') {
                        route = place.address_components[i]['long_name'];
                    } else if (addressType === 'locality') {
                        city = place.address_components[i]['long_name'];
                    } else if (addressType === 'administrative_area_level_1') {
                        state = place.address_components[i]['long_name'];
                    } else if (addressType === 'postal_code') {
                        zip = place.address_components[i]['short_name'];
                    }

                    _this.setState({
                        lookupLocation: place.formatted_address,
                        addressLine1: streetNumber + ' ' + route,
                        addressLine2: '',
                        city: city,
                        state: state,
                        zip: zip,
                        addressLatitude: location.lat(),
                        addressLongitude: location.lng()
                    });
                }

                _this.setMarkerFromPlace(location);
                _this.centerMapOnGeometry(location, place.geometry.viewport);
            } else {
                //todo not good
                alert("Address Not Found!");
            }
        });
    }

    setAutocompleteFromAddress(address) {
        let _this = this;
        if (address) {
            new window.google.maps.Geocoder().geocode({'address': address}, function (results, status) {
                if (status === 'OK') {
                    let location = results[0].geometry.location
                    _this.setMarkerFromPlace(location);
                    _this.centerMapOnGeometry(location, results[0].geometry.viewport);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }

    centerMapOnGeometry(loc, viewport) {
        this.setState({center: loc});
        if (this.mapContainer && viewport) {
            this.mapContainer.state.map.fitBounds(viewport);
        } else {
            this.setState({zoom: 10});
        }
    }

    setMarkerFromPlace = location => {
        this.setState({
            markers: [{
                position: location,
                showInfo: false,
            }]
        });
    };

    handleChange = event => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if ('zip' === name && (!CompanyDetails.isInteger(value) || value > 99999)) {
            return;
        }
        if ('phoneNumber' === name && (!CompanyDetails.isInteger(value) || value > 9999999999)) {
            return;
        }
        if (('feePercentage' === name || 'billingFeePercentage' === name) && (!CompanyDetails.isInteger(value) || value > 100)) {
            return;
        }
        if ('subscriptionFee' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }
        if ('companyImage' === name || 'legalAgreement' === name) {
            value = event.target.files;
        }
        if ('lookupLocation' === name) {
            //Clear this state every time the user types in the lookupLocation field as they invalidate the lat and lng.
            //Once the user selects an address from the lookup, then the lat and lng will get populated again.
            this.setState({
                addressLatitude: null,
                addressLongitude: null
            });
        }
        this.setState({[name]: value});
    };

    static isInteger(x) {
        return x.indexOf('.') < 0 && x % 1 === 0;
    }

    handleSubmit = event => {
        Busy.set(true);

        let allUploadFiles = [];
        if (this.state.companyImage) {
            allUploadFiles.push({
                files: this.state.companyImage,
                fileNameProperty: 'listingImageFileName',
                folder: 'listing-images',
                oldFileName: this.state.oldListingImageFileName,
                isImageFile: true
            });
        }
        if (this.state.legalAgreement) {
            allUploadFiles.push({
                files: this.state.legalAgreement,
                fileNameProperty: 'supplierLegalAgreementFileName',
                folder: 'legal-agreements',
                oldFileName: this.state.oldSupplierLegalAgreementFileName,
                isImageFile: false
            });
        }

        if (this.validateFiles(allUploadFiles)) {
            this.uploadFilesAndSubmitForm(this, allUploadFiles);
        }
    };

    validateFiles(allUploadFiles) {
        for (let i = 0; i < allUploadFiles.length; i++) {
            let fileToUpload = allUploadFiles[i];
            let file = fileToUpload.files ? fileToUpload.files[0] : '';
            if (file.size > 20000000) {
                Busy.set(false);
                toast.error('Selected file is too large.  Max file size is 20 Mb.');
                return false
            }
            if (fileToUpload.isImageFile) {
                if (file && !CompanyDetails.isImageFile(file)) {
                    Busy.set(false);
                    toast.error('File selected for listing image is not an image file.');
                    return false;
                }
            }
        }
        return true;
    }

    uploadFilesAndSubmitForm(_this, filesToUpload) {
        if (!filesToUpload || filesToUpload.length === 0) {
            _this.saveProfile();
            return;
        }

        let fileToUpload = filesToUpload.shift();
        let file = fileToUpload.files ? fileToUpload.files[0] : '';

        if (file && file.name) {
            _this.uploadFile(fileToUpload.folder, fileToUpload.oldFileName, file, function (uploadedFileName, textStatus, jqXHR) {
                _this.setState({[fileToUpload.fileNameProperty]: uploadedFileName});
                _this.uploadFilesAndSubmitForm(_this, filesToUpload);
            });
        }
    }

    uploadFile(folder, oldFileName, file, onSuccess) {

        let data = new FormData();
        data.append('file', file);
        let profileFileName = this.state.id + '_' + file.name;
        $.ajax({
            url: '/api/file/upload?folder=' + folder + '&name=' + profileFileName + '&oldName=' + oldFileName,
            type: 'POST',
            data: data,
            cache: false,
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            success: function (data, textStatus, jqXHR) {
                onSuccess(data, textStatus, jqXHR);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Busy.set(false);
                toast.error('File upload failed:  ' + textStatus);
            }
        });
    }

    static isImageFile(file) {
        let fileType = file['type'];
        let ValidImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
        return $.inArray(fileType, ValidImageTypes) >= 0;
    }

    saveProfile = () => {
        toast.dismiss();
        let errorMessage = null;

        let addressLookupFieldValue = document.getElementById('lookupLocation').value;
        if (!this.state.email) {
            errorMessage = "Please enter an email address.";
        } else if (!CompanyDetails.validateEmail(this.state.email)) {
            errorMessage = "Email address is invalid.";
        } else if (!this.state.companyName) {
            errorMessage = "Please enter your company name.";
        } else if (!this.state.firstName) {
            errorMessage = "Please enter your first name.";
        } else if (!this.state.lastName) {
            errorMessage = "Please enter your last name.";
        } else if (addressLookupFieldValue && (!this.state.addressLongitude || !this.state.addressLatitude)) {
            errorMessage = "Please select an address from the address lookup.";
        }
        if (errorMessage) {
            Busy.set(false);
            toast.error(errorMessage);
            return;
        }
        $.ajax({
            url: 'api/account',
            type: "POST",
            data: JSON.stringify({
                id: this.state.id,
                type: this.state.type,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                companyName: this.state.companyName,
                companyDescription: this.state.companyDescription,
                addressLatitude: addressLookupFieldValue ? this.state.addressLatitude : null,
                addressLongitude: addressLookupFieldValue ? this.state.addressLongitude : null,
                addressLine1: addressLookupFieldValue ? this.state.addressLine1 : null,
                addressLine2: addressLookupFieldValue ? this.state.addressLine2 : null,
                city: addressLookupFieldValue ? this.state.city : null,
                state: addressLookupFieldValue ? this.state.state : null,
                zip: addressLookupFieldValue ? this.state.zip : null,
                phoneNumber: this.state.phoneNumber,
                email: this.state.email,
                username: this.state.username,
                listingImageFileName: this.state.listingImageFileName,
                supplierLegalAgreementFileName: this.state.supplierLegalAgreementFileName,
                payoutSchedule: this.state.selectedPayoutScheduleType.value,
                useCalendarDays: this.state.selectedDurationChargeType === DURATION_CHARGE_TYPE_CALENDAR_DAY,
                feePercentage: this.state.feePercentage,
                activated: this.state.activated,
                subscriptionType: this.state.subscriptionType,
                subscriptionFee: this.state.subscriptionFee,
                billingFeePercentage: this.state.billingFeePercentage,
                subscriptionEffectiveDate: this.state.subscriptionEffectiveDate
            }),
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    handleSuccess = data => {
        Busy.set(false);
        this.setState(data);
        toast.success("Successfully updated account profile!")
        this.props.handleAccountUpdated(data);
    };

    static validateEmail(email) {
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        return reg.test(email);
    }

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        toast.error(errorMessage);
    };

    handlePayoutScheduleTypeSelected = value => {
        this.setState({selectedPayoutScheduleType: value});
    };

    handleDurationChargeTypeSelected = value => {
        this.setState({selectedDurationChargeType: value});
    };

    render() {
        return (
            <form className="ss-form ss-block">
                <div className="for-section-container">

                    <div className="for-section">
                        <h3 className="group-title company">Company information</h3>
                        <div>
                            <fieldset>
                                <label htmlFor="companyName">COMPANY NAME</label>
                                <input type="text"
                                       id="companyName"
                                       name="companyName"
                                       value={this.state.companyName}
                                       onChange={this.handleChange}
                                       placeholder="Enter your company name"
                                />
                            </fieldset>

                            <fieldset>
                                <label htmlFor="email">EMAIL</label>
                                <input type="text"
                                       id="email"
                                       name="email"
                                       value={this.state.email}
                                       onChange={this.handleChange}
                                       placeholder="Please enter an email address"
                                />
                            </fieldset>

                            <fieldset>
                                <label htmlFor="phoneNumber">PHONE NUMBER</label>
                                <input type="text"
                                       id="phoneNumber"
                                       name="phoneNumber"
                                       value={this.state.phoneNumber}
                                       onChange={this.handleChange}
                                       placeholder="Please enter your phone number"
                                />
                            </fieldset>
                        </div>
                        <div>
                            <fieldset>
                                <label htmlFor="companyDescription">COMPANY DESCRIPTION</label>
                                <textarea
                                    id="companyDescription"
                                    name="companyDescription"
                                    value={this.state.companyDescription}
                                    onChange={this.handleChange}
                                    placeholder="Describe your company in a few words"
                                />
                            </fieldset>

                            <fieldset>
                                <label htmlFor="lookupLocation">LOCATION</label>
                                <input type="text"
                                       id="lookupLocation"
                                       name="lookupLocation"
                                       value={this.state.lookupLocation}
                                       onChange={this.handleChange}
                                       placeholder="Enter your company address"
                                />
                                <LocationMap
                                    ref={(mapContainer) => {
                                        this.mapContainer = mapContainer;
                                    }}
                                    containerElement={
                                        <div style={{height: `265px`}}/>
                                    }
                                    mapElement={
                                        <div style={{height: `265px`}}/>
                                    }
                                    center={this.state.center}
                                    zoom={this.state.zoom}
                                    options={{
                                        styles: MapStyle,
                                        mapTypeControl: false,
                                        streetViewControl: false,
                                        fullscreenControl: false,
                                        zoomControl: false,
                                        scrollwheel: false
                                    }}
                                    markers={this.state.markers}
                                />
                            </fieldset>
                        </div>
                    </div>

                    <div className="for-section">
                        <h3 className="group-title company-image">Company image</h3>
                        <p className="ss-details">Select an image file that will display on your Company profile
                            page.</p>
                        <fieldset
                            className={(this.state.listingImageFileName ? "ss-top " : "ss-stand-alone ") + "ss-file-chooser"}>
                            <label htmlFor="companyImage">Choose File</label>
                            <input type="file" id="companyImage" name="companyImage" onChange={this.handleChange}/>
                            <span>{this.state.companyImage && this.state.companyImage.length > 0 ? this.state.companyImage[0].name : 'No file chosen'}</span>
                        </fieldset>
                        <fieldset className="ss-bottom ss-top">
                            {this.state.listingImageFileName ?
                                <img alt="" className="img-responsive"
                                     src={'https://s3-us-west-1.amazonaws.com/securspace-files/listing-images/' + this.state.listingImageFileName}/> : ''}
                        </fieldset>

                    </div>
                    <div className="for-section">

                        <h3 className="group-title user">Personal information</h3>
                        <div>
                            <fieldset>
                                <label htmlFor="firstName">FIRST NAME</label>
                                <input type="text"
                                       id="firstName"
                                       name="firstName"
                                       value={this.state.firstName}
                                       onChange={this.handleChange}
                                       placeholder="Enter your first name"
                                />
                            </fieldset>
                            <fieldset>
                                <label htmlFor="lastName">LAST NAME</label>
                                <input type="text"
                                       id="lastName"
                                       name="lastName"
                                       value={this.state.lastName}
                                       onChange={this.handleChange}
                                       placeholder="Enter your last name"
                                />
                            </fieldset>
                        </div>

                        {this.state.type === 'Supplier' ?
                            <h3 className="group-title agreement-image">Legal Agreement</h3>
                            : ''
                        }
                        {this.state.type === 'Supplier' ?
                            <p className="ss-details">Select the legal agreement file the user will have to accept
                                before they can book space.</p>
                            : ''
                        }
                        {this.state.type === 'Supplier' ?
                            <fieldset className={"ss-stand-alone ss-file-chooser"}>
                                <label htmlFor="legalAgreement">Choose File</label>
                                <input type="file" id="legalAgreement" name="legalAgreement"
                                       onChange={this.handleChange}/>
                                <span>{this.state.legalAgreement && this.state.legalAgreement.length > 0 ? this.state.legalAgreement[0].name : 'No file chosen'}</span>
                            </fieldset>
                            : ''
                        }
                        {this.state.type === 'Supplier' && this.state.supplierLegalAgreementFileName ?
                            <fieldset className="ss-link-preview">
                                <a href={'https://s3-us-west-1.amazonaws.com/securspace-files/legal-agreements/' + this.state.supplierLegalAgreementFileName}
                                   target="_blank" rel="noopener noreferrer">View Legal Agreement</a>
                            </fieldset>
                            : ''
                        }
                        {this.state.type === 'Supplier' ?
                            <h3 className="group-title schedule-image">Payout Schedule</h3>
                            : ''
                        }
                        {this.state.type === 'Supplier' ?
                            <div className="hs-selector">
                                <ButtonSelector
                                    options={PAYOUT_SCHEDULE_TYPES}
                                    selectedOption={this.state.selectedPayoutScheduleType}
                                    handleOptionSelected={this.handlePayoutScheduleTypeSelected}
                                    buttonHeight={"31px"}
                                    buttonWidth={"80px"}
                                />
                            </div>
                            : ''
                        }
                        {this.state.type === 'Supplier' ?
                            <div className="hs-selector">
                                <h3 className="group-title charge-image">Charge model</h3>
                                <ButtonSelector options={DURATION_CHARGE_TYPES}
                                                selectedOption={this.state.selectedDurationChargeType}
                                                handleOptionSelected={this.handleDurationChargeTypeSelected}
                                                buttonHeight={"31px"}
                                                buttonWidth={"120px"}
                                />
                            </div>
                            : ''
                        }
                    </div>
                    {
                        this.props.account.userType === 'ADMIN' ?
                            <div className="for-section">
                                <h3 className="group-title info-image">Admin information</h3>
                                {this.state.type === 'Supplier' ?
                                    <div>
                                        <fieldset className="ss-securspace-fee ss-stand-alone">
                                            <label htmlFor="feePercentage">MARKETPLACE COMMISSION FEE %</label>
                                            <input type="text"
                                                   id="feePercentage"
                                                   name="feePercentage"
                                                   value={this.state.feePercentage}
                                                   onChange={this.handleChange}
                                                   placeholder="Enter the SecurSpace Fee Percentage"
                                            />
                                        </fieldset>
                                        <fieldset className="ss-subscription ss-stand-alone">
                                            <label htmlFor="subscriptionType">SUBSCRIPTION TYPE</label>
                                            <Select id="subscriptionType"
                                                    name="subscriptionType"
                                                    optionsWidth="300px"
                                                    handleChange={this.handleChange}
                                                    selectedOption={this.state.subscriptionType}
                                                    placeholder="Choose"
                                                    options={[
                                                        "MARKETPLACE_ONLY",
                                                        "GMS_LITE",
                                                        "GMS_PRO"
                                                    ]}
                                            />
                                        </fieldset>
                                        <fieldset className="ss-subscription-start-date ss-stand-alone">
                                            <label htmlFor="subscriptionFee">SUBSCRIPTION START DATE</label>
                                            <DatePicker id="subscriptionEffectiveDate"
                                                        name="subscriptionEffectiveDate"
                                                        value={this.state.subscriptionEffectiveDate}
                                                        onChange={this.handleChange}
                                                        width="120px"
                                            />
                                        </fieldset>
                                        <fieldset className="ss-subscription-fee ss-stand-alone">
                                            <label htmlFor="subscriptionFee">SUBSCRIPTION MONTHLY FEE AMOUNT</label>
                                            <input type="text"
                                                   id="subscriptionFee"
                                                   name="subscriptionFee"
                                                   value={formatCurrencyValue(this.state.subscriptionFee, true)}
                                                   onChange={this.handleChange}
                                                   placeholder="Enter the monthly charge for the selected GMS subscription"
                                            />
                                        </fieldset>
                                        <fieldset className="ss-subscription-billing-fee ss-stand-alone">
                                            <label htmlFor="billingFeePercentage">SUBSCRIPTION BILLING FEE %</label>
                                            <input type="text"
                                                   id="billingFeePercentage"
                                                   name="billingFeePercentage"
                                                   value={this.state.billingFeePercentage}
                                                   onChange={this.handleChange}
                                                   placeholder="Enter the fee percentage charged for each non-marketplace booking billed through SecurSpace"
                                            />
                                        </fieldset>
                                    </div>
                                    : ''
                                }
                            </div>
                            :
                            <div className="for-section"/>
                    }
                    <div className="for-section"/>
                </div>

                <div className="ss-button-container border-top text-center">
                    <button type="button" className="ss-button-primary" onClick={this.handleSubmit}>Save Changes
                    </button>
                </div>
            </form>
        )
    }
}

export default CompanyDetails;
