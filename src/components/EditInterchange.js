import React, {Component} from 'react';
import ContainerEntryField from "./ContainerEntryField";
import Error from "./Error";
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "./Busy";
import moment from "moment/moment";
import DateTimePicker from "./DateTimePicker";

const $ = window.$;
export default class EditInterchange extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        this.initFormFields(this.props.editItem);
        this.loadAssetTypes();
        this.loadSelectedAsset();
    }

    loadAssetTypes() {
        $.ajax({
            url: 'api/types/assets',
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                if (data) {
                    this.setState({assetTypes: data});
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });

    }

    loadSelectedAsset = () => {

        $.ajax({
            url: `api/interchanges/${this.props.editItem.id}`,
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                if (data) {
                    this.setState({
                        assetType: data.assetType ? data.assetType : '',
                        containerNumber: data.containerNumber ? data.containerNumber : '',
                        chassisNumber: data.chassisNumber ? data.chassisNumber : '',
                        chassisLicensePlateNumber: data.chassisLicensePlateNumber ? data.chassisLicensePlateNumber : '',
                        sealNumber: data.sealNumber ? data.sealNumber : '',
                        eventType: data.eventType,
                        eventDate: data.eventDate,
                        driverFirstName: data.firstName ? data.firstName : '',
                        driverLastName: data.lastName ? data.lastName : '',
                        driverLicenseNumber: data.licenseNumber ? data.licenseNumber : '',
                        truckLicensePlateNumber: data.truckLicensePlate ? data.truckLicensePlate : '',
                        notes: data.notes ? data.notes : '',
                    });
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });

    };

    handleFieldChange = event => {
        let name = event.target.name;
        let value = event.target.value;

        if (name !== "eventDate") {
            value = value.toUpperCase();
        }

        this.setState({[name]: value});
    };

    handleContainerIdFieldChange = containerNumber => {
        this.setState({containerNumber: containerNumber});
    };

    initFormFields = data => {
        this.setState({
            id: data.id ? data.id : '',
            locationId: data.locationId ? data.locationId : '',
            assetType: data.assetType ? data.assetType : '',
            eventDate: data.eventDate ? data.eventDate : '',
            errorMessage: '',
            containerNumber: data.containerNumber ? data.containerNumber : '',
            chassisNumber: data.chassisNumber ? data.chassisNumber : '',
            chassisLicensePlateNumber: data.chassisLicensePlateNumber ? data.chassisLicensePlateNumber : '',
            sealNumber: data.sealNumber ? data.sealNumber : '',
            driverFirstName: data.driverFirstName ? data.driverFirstName : '',
            driverLastName: data.driverLastName ? data.driverLastName : '',
            driverLicenseNumber: data.driverLicenseNumber ? data.driverLicenseNumber : '',
            truckLicensePlateNumber: data.truckLicensePlateNumber ? data.truckLicensePlateNumber : '',
            notes: data.notes ? data.notes : '',
            assetSize: data.assetSize ? data.assetSize : '',
            assetTypes: []
        })
    };

    saveChanges = () => {

        this.setState({errorMessage: ''});

        if (!this.state.eventDate) {
            this.setState({errorMessage: "Please enter an event date"});
            return;
        }

        Busy.set(true);

        let eventDate = moment(this.state.eventDate).toISOString(true);
        $.ajax({
            url: 'api/inventory-activity',
            data: JSON.stringify({
                id: this.state.id,
                containerNumber: this.state.containerNumber,
                chassisNumber: this.state.chassisNumber,
                chassisLicensePlateNumber: this.state.chassisLicensePlateNumber,
                sealNumber: this.state.sealNumber,
                firstName: this.state.driverFirstName,
                lastName: this.state.driverLastName,
                licenseNumber: this.state.driverLicenseNumber,
                truckLicensePlate: this.state.truckLicensePlateNumber,
                notes: this.state.notes,
                eventDate: eventDate,
                eventType: this.state.eventType,
            }),
            type: 'PUT',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                if (data.id) {
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
                    {this.state.id ?
                        <div>

                            <div className="modal-body">
                                {this.state.containerNumber ?
                                    <ContainerEntryField className="ss-top"
                                                         valueCallback={this.handleContainerIdFieldChange}
                                                         initState={this.state.containerNumber}/>
                                    :
                                    null
                                }


                                <fieldset className="ss-middle">
                                    <label htmlFor="chassisNumber">CHASSIS NUMBER</label>
                                    <input type="text"
                                           id="chassisNumber"
                                           name="chassisNumber"
                                           value={this.state.chassisNumber}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the chassis number"
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label htmlFor="chassisLicensePlateNumber">CHASSIS LICENSE PLATE NUMBER</label>
                                    <input type="text"
                                           id="chassisLicensePlateNumber"
                                           name="chassisLicensePlateNumber"
                                           value={this.state.chassisLicensePlateNumber}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the chassis license plate number"
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label htmlFor="sealNumber">SEAL NUMBER</label>
                                    <input type="text"
                                           id="sealNumber"
                                           name="sealNumber"
                                           value={this.state.sealNumber}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the seal number"
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label
                                        htmlFor="eventDate">{this.state.eventType === 'CHECK_IN' ? 'CHECK IN DATE' : 'CHECK OUT DATE'}</label>
                                    <DateTimePicker id="eventDate"
                                                    name="eventDate"
                                                    value={this.state.eventDate}
                                                    onChange={this.handleFieldChange}
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label htmlFor="driverFirstName">DRIVER'S FIRST NAME</label>
                                    <input type="text"
                                           id="driverFirstName"
                                           name="driverFirstName"
                                           value={this.state.driverFirstName}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the driver's first name"
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label htmlFor="driverLastName">DRIVER'S LAST NAME</label>
                                    <input type="text"
                                           id="driverLastName"
                                           name="driverLastName"
                                           value={this.state.driverLastName}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the driver's last name"
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label htmlFor="driverLicenseNumber">DRIVER LICENCE NUMBER</label>
                                    <input type="text"
                                           id="driverLicenseNumber"
                                           name="driverLicenseNumber"
                                           value={this.state.driverLicenseNumber}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the driver license number"
                                    />
                                </fieldset>
                                <fieldset className="ss-middle">
                                    <label htmlFor="truckLicensePlateNumber">TRUCK LICENSE PLATE NUMBER</label>
                                    <input type="text"
                                           id="truckLicensePlateNumber"
                                           name="truckLicensePlateNumber"
                                           value={this.state.truckLicensePlateNumber}
                                           onChange={this.handleFieldChange}
                                           placeholder="Enter the truck's license plate number"
                                    />
                                </fieldset>
                                <fieldset className="ss-bottom">
                                    <label htmlFor="notes">REMARKS OR NOTES</label>
                                    <textarea type="text"
                                              id="notes"
                                              name="notes"
                                              value={this.state.notes}
                                              onChange={this.handleFieldChange}
                                              placeholder="Enter any notes about the check in."
                                    />
                                </fieldset>

                                {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}
                            </div>
                            <div className="modal-footer">
                                <div className="table text-center">
                                    <button type="button" className="ss-button-secondary"
                                            onClick={() => this.saveChanges()}>Save Changes
                                    </button>
                                    <button type="button" className="ss-button-primary"
                                            onClick={() => this.props.handlePanelCloseEvent()}>Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                        :
                        null}
                </form>
            </div>
        )

    }
}