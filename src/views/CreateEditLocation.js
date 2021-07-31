import React, {Component} from 'react';
import {GoogleMap, InfoWindow, Marker, withGoogleMap} from "react-google-maps/lib";
import {
    formatCurrencyValue,
    getPricePerDayFromMonthlyRate,
    getPricePerDayFromWeeklyRate,
    parseCurrencyValue,
    validateCurrencyValue
} from '../util/PaymentUtils';

import '../css/views/createEditLocation.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import "../css/components/closeIcon.css";
import {createLogoutOnFailureHandler} from '../util/LogoutUtil'
import Error from "../components/Error";
import LocationFeatures from "../components/LocationFeatures";
import EquipmentTypes from "../components/EquipmentTypes";
import Busy from "../components/Busy";
import {createLocationFromAddress} from "../util/AddressUtil";
import ToggleButton from "../components/ToggleButton";
import MapStyle from "../components/MapStyle";
import ReferenceOption from "../controls/ReferenceOption";
import Select from "../components/Select";
import ReactTooltip from 'react-tooltip';
import LocationEquipmentType from "./LocationEquipmentType";
import DropGallery from "../components/DropGallery";
import DropFile from "../components/DropFile";

const $ = window.$;
const google = window.google;
const geocoder = new window.google.maps.Geocoder();

const GALLERY_BUCKET = "gallery";
const FILE_BUCKET = "listing-images";

let autocomplete;

const SupplierSearchMap = withGoogleMap(props => (
    <GoogleMap
        ref={(map) => {
            // this.map = map;F
        }}
        defaultZoom={4}
        center={props.center}
        zoom={props.zoom}
        options={props.options}
        onClick={props.onClick}
    >
        {props.markers.map((marker, index) => (
            <Marker
                key={index}
                position={marker.position}
                onClick={() => props.onMarkerClick(marker)}
                icon={marker.icon}
                animation={google.maps.Animation.DROP}
            >
                {marker.showInfo && (
                    <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
                        <div>{marker.infoContent}</div>
                    </InfoWindow>
                )}
            </Marker>
        ))}
    </GoogleMap>
));

class CreateEditLocation extends Component {
    constructor(props) {
        super(props);
        let mapData = {
            center: {
                lat: 37.090240,
                lng: -95.712891
            },
            zoom: 4,
            markers: [],
        };

        let location;

        if (this.props.locationToEdit) {
            location = this.props.locationToEdit;
        } else {
            location = {
                id: '',
                locationName: '',
                locationDescription: '',
                instructions: '',
                addressLatitude: null,
                addressLongitude: null,
                addressLine1: null,
                addressLine2: null,
                city: null,
                state: null,
                zip: null,
                phoneNumber: '',
                pricePerDay: '',
                pricePerWeek: '',
                pricePerMonth: '',
                listingImageFileName: '',
                locationEquipmentTypes: [],
                locationFeatures: [],
                managedLocation: true,
                managedSpaces: 1,
                createdOn: null,
                minDuration: 'DAILY',
                minNumberOfSpaces: '1',
                removeLocationImage: false,
                live: false,
                totalNumberOfSpaces: '',
                overageRate: '',
                chargeOverages: true,
                overageGracePeriodInMinutes: 0
            }
        }

        let lookupLocation = createLocationFromAddress(location);

        this.state = Object.assign(
            location,
            {
                updateSuccessful: false,
                errorMessage: '',
                lookupLocation: lookupLocation,
                oldListingImageFileName: location ? location.listingImageFileName : '',
                equipmentTypes: CreateEditLocation.createEquipmentTypes(location),
                features: CreateEditLocation.createFeatures(location),
                loggedOut: false,
                doneEditingLocation: false
            },
            mapData);

        this.dropzone = null;
        this.dropfile = null;

        this.setAutocompleteFromAddress(lookupLocation);
    }

    static createEquipmentTypes(location) {
        let equipmentTypeLabels = EquipmentTypes.OPTIONS;
        let locationEquipmentTypes = location ? location.locationEquipmentTypes : null;

        return CreateEditLocation.createLocationItemList(equipmentTypeLabels, locationEquipmentTypes, "equipmentType");
    }

    static createFeatures(location) {
        let features = LocationFeatures.OPTIONS;
        let locationFeatures = location ? location.locationFeatures : null;
        return CreateEditLocation.createLocationItemList(features, locationFeatures, "feature")
    }

    static createLocationItemList(locationItemLabels, locationItems, locationItemProperty) {
        let locationItemList = {};
        for (let index = 0; index < locationItemLabels.length; index++) {
            let id = null;
            let label = locationItemLabels[index];
            let value = false;

            if (locationItems) {
                for (let i = 0; i < locationItems.length; i++) {
                    let locationItem = locationItems[i];
                    if (label === locationItem[locationItemProperty]) {
                        id = locationItem.id;
                        value = true;
                    }
                }
            }

            locationItemList[locationItemProperty + index] = {
                id: id,
                label: label,
                value: value
            };
        }
        return locationItemList;
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

                let geoLocation = place.geometry.location;

                for (let i = 0; i < place.address_components.length; i++) {
                    let addressType = place.address_components[i].types[0];
                    let addressType2 = '';
                    if (place.address_components[i].types.length === 2) {
                        addressType2 = place.address_components[i].types[1];
                    }

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
                    } else if (addressType2 === 'political' && !city) {
                        city = place.address_components[i]['long_name'];
                    }

                    _this.setState({
                        lookupLocation: place.formatted_address,
                        addressLine1: streetNumber + ' ' + route,
                        addressLine2: '',
                        city: city,
                        state: state,
                        zip: zip,
                        addressLatitude: geoLocation.lat(),
                        addressLongitude: geoLocation.lng()
                    });
                }

                _this.setMarkerFromPlace(geoLocation);
                _this.centerMapOnGeometry(geoLocation, place.geometry.viewport);
            } else {
                alert("Address Not Found!");
            }
        });
    }

    setAutocompleteFromAddress(address) {
        let _this = this;
        if (address) {
            geocoder.geocode({'address': address}, function (results, status) {
                if (status === 'OK') {
                    let geoLocation = results[0].geometry.location;
                    _this.setMarkerFromPlace(geoLocation);
                    _this.centerMapOnGeometry(geoLocation, results[0].geometry.viewport);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }

    centerMapOnGeometry(loc, viewport) {
        this.setState({center: loc});
        if (viewport && this.mapContainer) {
            this.mapContainer.state.map.fitBounds(viewport);
        } else {
            this.setState({zoom: 10});
        }
    }

    setMarkerFromPlace = geoLocation => {
        this.setState({
            markers: [{
                position: geoLocation,
                showInfo: false,
            }]
        });
    };

    handleChange = event => {
        //Clear out success and error messages when the user begins editing again.
        this.setState({
            updateSuccessful: false,
            errorMessage: ''
        });

        let name = event.target.name;

        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if ('zip' === name && (!CreateEditLocation.isInteger(value) || value > 99999)) {
            return;
        }
        if ('phoneNumber' === name && (!CreateEditLocation.isInteger(value) || value > 9999999999)) {
            return;
        }
        if ('pricePerDay' === name || 'pricePerWeek' === name || 'pricePerMonth' === name || 'overageRate' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }
        if ('listingImage' === name) {
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

    handleSelectChange = event => {
        this.setState({[event.target.name]: event.target.value.value});
    };

    clearMessages() {
        this.setState({
            updateSuccessful: false,
            errorMessage: ''
        });
    }

    handleEquipmentTypeChange = event => {
        //Clear out success and error messages when the user begins editing again.
        this.setState({
            updateSuccessful: false,
            errorMessage: ''
        });

        let name = event.target.name;
        let value = event.target.checked;

        //This merges the new value for the value property into the equipmentType object without overwriting the other property values
        let updatedValueEquipmentType = Object.assign({}, this.state.equipmentTypes[name], {value: value});
        //This merges the new value for the equipmentType into the equipmentTypes object without overwriting the other equipment types
        let updatedValueEquipmentTypes = Object.assign({}, this.state.equipmentTypes, {
            [name]: updatedValueEquipmentType,
        });

        this.setState({
            equipmentTypes: updatedValueEquipmentTypes,
        });

    };

    handleFeatureChange = event => {
        //Clear out success and error messages when the user begins editing again.
        this.setState({
            updateSuccessful: false,
            errorMessage: ''
        });

        let name = event.target.name;
        let value = event.target.checked;

        //This merges the new value for the value property into the feature object without overwriting the other property values
        let updatedValueFeature = Object.assign({}, this.state.features[name], {value: value});
        //This merges the new value for the feature into the features object without overwriting the other equipment types
        let updatedValueFeatures = Object.assign({}, this.state.features, {
            [name]: updatedValueFeature,
        });

        this.setState({
            features: updatedValueFeatures,
        });
    };

    static isInteger(x) {
        return x.indexOf('.') < 0 && x % 1 === 0;
    }

    static preventDefault(event) {
        event.stopPropagation(); // Stop stuff happening
        event.preventDefault(); // Totally stop stuff happening
    }

    handleSubmit = event => {

        this.setState({errorMessage: ''});
        if (!this.state.locationName) {
            this.setErrorMessage("Please enter a Location Name.");
            return;
        }
        let addressLookupFieldValue = document.getElementById('lookupLocation').value;
        if (!addressLookupFieldValue) {
            this.setErrorMessage("Please enter a Location Address.");
            return;
        }
        if (addressLookupFieldValue && (!this.state.addressLongitude || !this.state.addressLatitude)) {
            this.setErrorMessage("Please select a Location Address from the address lookup.");
            return;
        }
        let addressLine1 = addressLookupFieldValue ? this.state.addressLine1 : null;
        if (!addressLine1 || (addressLine1 && !addressLine1.trim())) {
            this.setErrorMessage("Address must contain a street number and name.");
            return;
        }
        let city = addressLookupFieldValue ? this.state.city : null;
        if (!city) {
            this.setErrorMessage("Address must contain a city.");
            return;
        }
        let state = addressLookupFieldValue ? this.state.state : null;
        if (!state) {
            this.setErrorMessage("Address must contain a state.");
            return;
        }
        let zip = addressLookupFieldValue ? this.state.zip : null;
        if (!zip) {
            this.setErrorMessage("Address must contain a zip code.");
            return;
        }

        if (!this.state.phoneNumber) {
            this.setErrorMessage("Please enter a phone number for this location.");
            return;
        }
        if (this.state.managedLocation && !this.state.managedSpaces) {
            this.setErrorMessage("Number of spaces must be greater than zero for automated management.");
            return;
        }

        let allUploadFiles = [];
        if (this.dropfile && this.dropfile.files.length > 0) {
            for (let i = 0; i < this.dropfile.files.length; i++) {
                let file = this.dropfile.files[i];

                if (file && file.type !== 'fake') {
                    //new file
                    allUploadFiles.push({
                        files: [file],
                        fileNameProperty: 'listingImageFileName',
                        folder: 'listing-images',
                        oldFileName: this.state.oldListingImageFileName,
                        isImageFile: true
                    });
                }
            }
        }


        if (this.validateFiles(allUploadFiles)) {
            Busy.set(true);
            this.uploadFilesAndSubmitForm(this, allUploadFiles);
        }
    };

    validateFiles(allUploadFiles) {
        for (let i = 0; i < allUploadFiles.length; i++) {
            let fileToUpload = allUploadFiles[i];
            let file = fileToUpload.files ? fileToUpload.files[0] : '';
            if (file.size > 20000000) {
                Busy.set(false);
                this.setState({errorMessage: 'Selected file is too large.  Max file size is 20 Mb.'});
                return false
            }
            if (fileToUpload.isImageFile) {
                if (file && !CreateEditLocation.isImageFile(file)) {
                    Busy.set(false);
                    this.setState({errorMessage: 'File selected for listing image is not an image file.'});
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
        let _this = this;

        let data = new FormData();
        data.append('file', file);
        let time = new Date().getTime();
        let profileFileName = this.props.account.id + '_' + time + '_' + file.name;
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
                _this.setState({errorMessage: 'File upload failed:  ' + textStatus});
            }
        });
    }

    uploadFileData(folder, file, onSuccess) {
        let _this = this;

        let data = new FormData();
        data.append('inputStream', file.dataURL);
        let time = new Date().getTime();
        let profileFileName = this.props.account.id + '_' + time + '_' + file.name;
        $.ajax({
            url: '/api/file/upload-data?folder=' + folder + '&name=' + profileFileName + '&contentType=' + file.type,
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
                _this.setState({errorMessage: 'File upload failed:  ' + textStatus});
            }
        });
    }

    static isImageFile(file) {
        let fileType = file['type'];
        let ValidImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
        return $.inArray(fileType, ValidImageTypes) >= 0;
    }

    saveProfile = () => {

        let _this = this;
        let addressLookupFieldValue = document.getElementById('lookupLocation').value;

        let equipmentTypesList = [];

        Object.keys(_this.state.locationEquipmentTypes).forEach(function (key) {
            let equipmentType = _this.state.locationEquipmentTypes[key];
            equipmentTypesList.push({
                id: equipmentType.id,
                equipmentType: equipmentType.equipmentType,
                pricePerDay: parseCurrencyValue(equipmentType.pricePerDay),
                pricePerWeek: parseCurrencyValue(equipmentType.pricePerWeek),
                pricePerMonth: parseCurrencyValue(equipmentType.pricePerMonth),
            })

        });

        let featuresList = [];
        Object.keys(this.state.features).forEach(function (key) {
            let feature = _this.state.features[key];
            if (feature.value) {
                featuresList.push({
                    id: feature.id,
                    feature: feature.label
                })
            }
        });

        $.ajax({
            url: 'api/location',
            data: JSON.stringify({
                id: this.state.id,
                locationName: this.state.locationName,
                locationDescription: this.state.locationDescription,
                instructions: this.state.instructions,
                addressLatitude: addressLookupFieldValue ? this.state.addressLatitude : null,
                addressLongitude: addressLookupFieldValue ? this.state.addressLongitude : null,
                addressLine1: addressLookupFieldValue ? this.state.addressLine1 : null,
                addressLine2: addressLookupFieldValue ? this.state.addressLine2 : null,
                city: addressLookupFieldValue ? this.state.city : null,
                state: addressLookupFieldValue ? this.state.state : null,
                zip: addressLookupFieldValue ? this.state.zip : null,
                phoneNumber: this.state.phoneNumber,
                pricePerDay: parseCurrencyValue(this.state.pricePerDay),
                pricePerWeek: parseCurrencyValue(this.state.pricePerWeek),
                pricePerMonth: parseCurrencyValue(this.state.pricePerMonth),
                overageRate: parseCurrencyValue(this.state.overageRate),
                listingImageFileName: (_this.dropfile && _this.dropfile.files.length > 0) ? this.state.listingImageFileName : '',
                account: {
                    id: this.props.account.id
                },
                locationEquipmentTypes: equipmentTypesList,
                locationFeatures: featuresList,
                managedLocation: this.state.managedLocation,
                managedSpaces: this.state.managedLocation ? this.state.managedSpaces : 0,
                minNumberOfSpaces: this.state.minNumberOfSpaces,
                minDuration: this.state.minDuration,
                live: this.state.live,
                totalNumberOfSpaces: this.state.totalNumberOfSpaces,
                chargeOverages: this.state.chargeOverages,
                overageGracePeriodInMinutes: this.state.overageGracePeriodInMinutes
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.saveGallery,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });

    };

    handleSuccess = updatedLocation => {
        Busy.set(false);
        this.setState(Object.assign(updatedLocation, {
            oldListingImageFileName: updatedLocation.listingImageFileName,
            updateSuccessful: true,
            errorMessage: '',
            equipmentTypes: CreateEditLocation.createEquipmentTypes(updatedLocation),
            features: CreateEditLocation.createFeatures(updatedLocation),
            doneEditingLocation: true
        }));

        this.props.updateEditLocation(updatedLocation);
        setTimeout(this.props.closeModal(), 500);
    };

    saveGallery = updatedLocation => {
        let uploadedGalleryFiles = [];
        this.galleryFiles = [];

        if (this.dropzone && this.dropzone.files.length > 0) {
            for (let i = 0; i < this.dropzone.files.length; i++) {
                let file = this.dropzone.files[i];
                if (file && file.type !== 'fake') {
                    //new file
                    uploadedGalleryFiles.push(file);
                } else {
                    this.galleryFiles.push(file.name);
                }
            }
        }
        this.uploadGallery(this, uploadedGalleryFiles, updatedLocation);
    };

    updateGalleryTable = updatedLocation => {
        // save files names in gallery table and delete???

        $.ajax({
            url: 'api/location/gallery',
            data: JSON.stringify({
                location: updatedLocation,
                galleryFiles: this.galleryFiles
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });

    };

    uploadGallery(_this, uploadedGalleryFiles, updatedLocation) {
        if (!uploadedGalleryFiles || uploadedGalleryFiles.length === 0) {
            //save gallery imahes in the location_gallery table
            _this.updateGalleryTable(updatedLocation);
            return;
        }

        let file = uploadedGalleryFiles.shift();

        if (file && file.name) {

            _this.uploadFileData(GALLERY_BUCKET + '/' + this.state.id, file, function (uploadedFileName, textStatus, jqXHR) {
                _this.galleryFiles.push(uploadedFileName);
                _this.uploadGallery(_this, uploadedGalleryFiles, updatedLocation);
            });
        }
    }

    updateDropzone = dropzone => {
        this.dropzone = dropzone;
    };

    updateDropfile = dropzone => {
        this.dropfile = dropzone;
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({
            updateSuccessful: false,
            errorMessage: jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error"
        });
    };

    setErrorMessage(message) {
        Busy.set(false);
        this.setState({
            updateSuccessful: false,
            errorMessage: message
        });
    }

    updateLocationEquipmentTypes = temp => {
        //update with values from child LocationEquipmentTypes
        this.setState({locationEquipmentTypes: temp});
    };

    static validateEmail(email) {
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(email);
    }


    render() {
        let _this = this;

        return (
            <div id="ssCreateEditLocation">
                <div className="modal-content ">
                    <div className="popup-header">
                        <img alt=""
                             src="../app-images/locations/edit_location_icon.svg"/>
                        <h1>{this.props.locationToEdit ? "Edit" : "Create"} Location Profile</h1>
                        <span
                            className="pointer pull-right"
                            onClick={() => this.props.closeModal()}>
                            <img alt="" src="../app-images/close.png"/>
                        </span>
                    </div>

                    <form className="ss-form ss-block">
                        <div id="ssLocationProfileFormContainer">

                            <p className="ss-summary ss-top-summary">
                                <span className="border-bottom-blue-line">Location information</span></p>


                            <fieldset className="hs-field">
                                <label htmlFor="locationName">LOCATION NAME
                                    <span data-tip
                                          data-for='locationName'
                                          className="location-name-tip"> <i
                                        className="fa fa-question-circle"></i></span></label>

                                <input type="text"
                                       id="locationName"
                                       name="locationName"
                                       value={this.state.locationName}
                                       onChange={this.handleChange}
                                       placeholder="Enter Location Name"
                                />
                                <ReactTooltip id="locationName" type="success" effect="solid"
                                              className="location-name-tip-hover">
                                    <span>Location name should not be the same as your company name.</span>
                                </ReactTooltip>
                            </fieldset>

                            <fieldset className="hs-field">
                                <label htmlFor="companyDescription">LOCATION DESCRIPTION</label>
                                <textarea id="locationDescription"
                                          name="locationDescription"
                                          value={this.state.locationDescription}
                                          onChange={this.handleChange}
                                          placeholder="Enter Location Description"
                                />
                            </fieldset>

                            <fieldset className="hs-field">
                                <label htmlFor="lookupLocation">LOCATION ADDRESS</label>
                                <input type="text"
                                       id="lookupLocation"
                                       name="lookupLocation"
                                       value={this.state.lookupLocation}
                                       onChange={this.handleChange}
                                       placeholder="Enter Location Address"
                                />
                            </fieldset>
                            <SupplierSearchMap
                                ref={(mapContainer) => this.mapContainer = mapContainer}
                                containerElement={<div id='locations-map' style={{height: `298px`}}/>}
                                mapElement={<div style={{height: `298px`}}/>}
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


                            <fieldset className="hs-field">
                                <label htmlFor="instructions">FACILITY INSTRUCTIONS
                                    <span data-tip
                                          data-for='facilityInstrTooltip'
                                          className="location-name-tip"> <i
                                        className="fa fa-question-circle"></i></span></label>

                                <textarea id="instructions"
                                          name="instructions"
                                          value={this.state.instructions ? this.state.instructions : ''}
                                          onChange={this.handleChange}
                                          placeholder="Enter Instructions on how to access your facility"
                                />
                                <ReactTooltip id="facilityInstrTooltip"
                                              type="success"
                                              effect="solid"
                                              className="location-name-tip-hover">
                                                <span>These instructions will be provided to Customers in their Booking
                                                    confirmation
                                                    email.</span>
                                </ReactTooltip>

                            </fieldset>

                            <p className="ss-summary">
                                <span className="border-bottom-blue-line">Location equipment</span></p>
                            <p>Default pricing</p>

                            <fieldset
                                className={'ss-top hs-field'}>
                                <label htmlFor="pricePerDay">PRICE PER DAY</label>
                                <input type="text"
                                       id="pricePerDay"
                                       name="pricePerDay"
                                       value={this.state.pricePerDay ? formatCurrencyValue(this.state.pricePerDay) : 0}
                                       onChange={this.handleChange}
                                       style={{width: this.state.pricePerDay ? "100px" : "calc(100% - 50px)"}}
                                       maxLength={10}
                                       placeholder="Enter the rental price per day for a single space"
                                />
                            </fieldset>

                            {this.props.account.userType === 'ADMIN' ?
                                <fieldset className="hs-field">
                                    <label htmlFor="pricePerWeek">PRICE PER WEEK</label>
                                    <span><input type="text"
                                                 id="pricePerWeek"
                                                 name="pricePerWeek"
                                                 value={this.state.pricePerWeek ? formatCurrencyValue(this.state.pricePerWeek) : 0}
                                                 onChange={this.handleChange}
                                                 style={{width: this.state.pricePerWeek ? "100px" : "calc(100% - 50px)"}}
                                                 maxLength={10}
                                                 placeholder="Enter the rental price per week for a single space"
                                    /></span>
                                    <span><strong>
                                                    {this.state.pricePerWeek ? "($" + getPricePerDayFromWeeklyRate(this.state.pricePerWeek) + " per day)" : ""}
                                                </strong>
                                                </span>
                                </fieldset>
                                : null}

                            <fieldset
                                className={'ss-top hs-field'}>
                                <label htmlFor="pricePerMonth">PRICE PER MONTH</label>
                                <input type="text"
                                       id="pricePerMonth"
                                       name="pricePerMonth"
                                       value={this.state.pricePerMonth ? formatCurrencyValue(this.state.pricePerMonth) : 0}
                                       onChange={this.handleChange}
                                       style={{width: this.state.pricePerMonth ? "100px" : "calc(100% - 50px)"}}
                                       maxLength={10}
                                       placeholder="Enter the rental price per month for a single space"
                                />
                                <span><strong>{this.state.pricePerMonth ? "($" + getPricePerDayFromMonthlyRate(this.state.pricePerMonth) + " avg per day)" : ""}
                                            </strong></span>
                            </fieldset>

                            <fieldset
                                className={'ss-top hs-field'}>
                                <label htmlFor="overageRate">OVERAGE RATE</label>
                                <input type="text"
                                       id="overageRate"
                                       name="overageRate"
                                       value={this.state.overageRate ? formatCurrencyValue(this.state.overageRate) : 0}
                                       onChange={this.handleChange}
                                       style={{width: this.state.overageRate ? "100px" : "calc(100% - 50px)"}}
                                       maxLength={10}
                                       placeholder="Enter the overage rate charged for a single space"
                                />
                            </fieldset>


                            <LocationEquipmentType
                                account={this.props.account}
                                locationEquipmentTypes={this.state.locationEquipmentTypes}
                                equipmentTypes={this.state.equipmentTypes}
                                updateLocationEquipmentTypes={this.updateLocationEquipmentTypes}
                                location={this.props.locationToEdit}
                            />

                            <fieldset className="ss-stand-alone  hs-field">
                                <label htmlFor="phoneNumber">PHONE NUMBER</label>
                                <input type="text"
                                       id="phoneNumber"
                                       name="phoneNumber"
                                       maxLength={10}
                                       value={this.state.phoneNumber}
                                       onChange={this.handleChange}
                                       placeholder="Enter phone number"
                                />
                            </fieldset>

                            <p className="ss-summary"><span className="border-bottom-blue-line">Location features</span>
                            </p>
                            {/*<p>Select which features apply to this location.</p>*/}
                            <div className="flex-center m-b">
                                <div className="location-items-column">
                                    <OptionColumn object={this.state.features} startIndex="0"
                                                  endIndexExclusive="5"
                                                  onChange={_this.handleFeatureChange}/>
                                </div>
                                <div className="location-items-column">
                                    <OptionColumn object={this.state.features} startIndex="5"
                                                  endIndexExclusive="999"
                                                  onChange={_this.handleFeatureChange}/>
                                </div>
                            </div>

                            {/*I created new components over the top of the awful file chooser input and tied it together with a*/}
                            {/*label with a htmlFor attribute pointing at the file chooser.*/}
                            <p className="ss-summary">
                                <span className="border-bottom-blue-line">Listing image</span>
                            </p>
                            <p>Select an image file that will display on Supplier search results.</p>

                            {/*<input type="file" id="listingImage" name="listingImage"*/}
                            {/*onChange={this.handleChange}/>*/}
                            {/*<span>{this.state.listingImage && this.state.listingImage.length > 0 ? this.state.listingImage[0].name : 'No file chosen'}</span>*/}

                            <fieldset className="ss-top ss-dz">
                                <DropFile bucket={FILE_BUCKET}
                                          locationFile={this.state.listingImageFileName}
                                          locationId={this.state.id}
                                          updateDropzone={this.updateDropfile}

                                />
                            </fieldset>


                            {/*{this.state.listingImageFileName ?*/}
                            {/*<fieldset className="">*/}
                            {/*<img alt="" className="img-responsive"*/}
                            {/*src={'https://s3-us-west-1.amazonaws.com/securspace-files/listing-images/' + this.state.listingImageFileName}*/}
                            {/*/></fieldset> : ''}*/}


                            <p className="ss-summary ss-top m-t"><span
                                className="border-bottom-blue-line">Image gallery</span>
                            </p>
                            <p>Drop files here to upload</p>
                            <fieldset className="ss-top ss-dz">
                                <DropGallery bucket={GALLERY_BUCKET}
                                             locationGallery={this.state.locationGallery}
                                             locationId={this.state.id}
                                             updateDropzone={this.updateDropzone}

                                />
                            </fieldset>


                            <p className="ss-summary"><span className="border-bottom-blue-line">Minimum Booking
                                            Requirements</span></p>
                            <fieldset className="ss-top hs-field price-day">
                                <label htmlFor="minNumberOfSpaces">MINIMUM NUMBER OF SPACES</label>
                                <input type="text"
                                       id="minNumberOfSpaces"
                                       name="minNumberOfSpaces"
                                       value={this.state.minNumberOfSpaces}
                                       onChange={this.handleChange}
                                       style={{width: this.state.pricePerDay ? "100px" : "calc(100% - 50px)"}}
                                       maxLength={10}
                                       placeholder="Enter the minimum number of spaces that need to be booked."
                                />
                            </fieldset>
                            <fieldset className="ss-top hs-field price-month">
                                <label htmlFor="minDuration">MINIMUM BOOKING DURATION</label>
                                <Select id="minDuration"
                                        name="minDuration"
                                        className="ss-book-space-form-asset-type"
                                        handleChange={this.handleSelectChange}
                                        selectedOption={this.state.minDuration}
                                        placeholder="Select the minimum duration for bookings."
                                        options={[new ReferenceOption('DAILY', 'DAILY'), new ReferenceOption('WEEKLY', 'WEEKLY'), new ReferenceOption('MONTHLY', 'MONTHLY')]}
                                />
                            </fieldset>

                            <p className="ss-summary"><span
                                className="border-bottom-blue-line">Automated Management</span>
                            </p>
                            <p>Allow automated approvals of space reservations.</p>
                            <br/>
                            <div>
                                <ToggleButton
                                    isActive={this.state.managedLocation}
                                    activeTag="Yes"
                                    inactiveTag="No"
                                    baseClass="toggle-section ss-toggle-button-recurring-base"
                                    activeClass="ss-toggle-button-recurring-active"
                                    inactiveClass="ss-toggle-button-recurring-inactive"
                                    value={this.state.managedLocation}
                                    onToggle={(value) => {
                                        this.setState({managedLocation: value})
                                    }}
                                />

                                <div id="managedSpacesDiv"
                                     className={(!this.state.managedLocation) ? "invisible" : ""}>
                                    <fieldset className="ss-top hs-field ss-stand-alone">
                                        <label htmlFor="managedSpaces">NUMBER OF AUTO-APPROVE SPACES</label>
                                        <input type="text"
                                               id="managedSpaces"
                                               name="managedSpaces"
                                               value={this.state.managedSpaces}
                                               onChange={this.handleChange}
                                               placeholder="Enter the number of spaces to be managed."
                                               disabled={(!this.state.managedLocation) ? "disabled" : ""}
                                        />
                                    </fieldset>
                                </div>

                                <div className="clear"></div>
                            </div>

                            {
                                this.props.account.userType === 'ADMIN' ?
                                    <div>
                                        <p className="ss-summary"><span className="border-bottom-blue-line">Location Capacity</span></p>
                                        <br/>
                                        <fieldset className="ss-top hs-field ss-entry">
                                            <label htmlFor="minNumberOfSpaces">TOTAL NUMBER OF SPACES</label>
                                            <input type="text"
                                                   id="totalNumberOfSpaces"
                                                   name="totalNumberOfSpaces"
                                                   value={this.state.totalNumberOfSpaces}
                                                   onChange={this.handleChange}
                                                   style={{width: "100px"}}
                                                   maxLength={10}
                                                   placeholder="Enter the total number of spaces available at this location."
                                            />
                                        </fieldset>

                                        <p className="ss-summary"><span className="border-bottom-blue-line">Location Live?</span></p>
                                        <br/>
                                        <div>
                                            <ToggleButton
                                                isActive={this.state.live}
                                                activeTag="Yes"
                                                inactiveTag="No"
                                                baseClass="toggle-section ss-toggle-button-recurring-base"
                                                activeClass="ss-toggle-button-recurring-active"
                                                inactiveClass="ss-toggle-button-recurring-inactive"
                                                value={this.state.live}
                                                onToggle={(value) => {
                                                    this.setState({live: value})
                                                }}
                                            />
                                            <div className="clear"></div>
                                        </div>
                                        <br/>
                                    </div>
                                    :
                                    ''
                            }

                            {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}

                        </div>
                        <div className="modal-footer">
                            <div className="table text-left">
                                <button type="button" className="ss-button-primary"
                                        onClick={this.handleSubmit}>
                                    Save
                                </button>

                                <button
                                    onClick={() => this.props.closeModal()}
                                    type="button" className="ss-button-secondary">Cancel
                                </button>

                            </div>
                        </div>

                    </form>
                </div>
            </div>
        )
    }
}

function OptionColumn(props) {
    return (
        <div>
            {
                Object.keys(props.object).map((key, index) =>
                    (index >= props.startIndex && index < props.endIndexExclusive) ?
                        <label className={"ss-checkbox"} key={key}>
                            <input type="checkbox" name={key} onChange={props.onChange}
                                   checked={props.object[key].value}/>
                            <span>{props.object[key].label}</span>
                        </label>
                        :
                        ''
                )
            }
        </div>
    )


}

export default CreateEditLocation;
