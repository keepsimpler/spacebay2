import React, {Component} from 'react';
import ContainerEntryField from "./ContainerEntryField";
import Select from "./Select";
import Error from "./Error";
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import ReferenceOption from "../controls/ReferenceOption";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "./Busy";
import {toast} from "react-toastify";

const $ = window.$;

export default class EditInventory extends Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({
            errorMessage: '',
            assetTypes: [],
            id: '',
            locationId: '',
            assetType: '',
            containerNumber: '',
            chassisNumber: '',
            chassisLicensePlateNumber: '',
            sealNumber: '',
            driverFirstName: '',
            driverLastName: '',
            driverLicenseNumber: '',
            truckLicensePlateNumber: '',
            notes: '',
            assetSize: ''
        });
    }

    componentDidMount() {
        this.loadAssetTypes();
    }

    loadAssetTypes() {
        Busy.set(true);
        $.ajax({
            url: 'api/types/assets',
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (assetTypes) => {
                this.loadSelectedAsset(assetTypes);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });

    }

    loadSelectedAsset = assetTypes => {

        $.ajax({
            url: `api/inventories/${this.props.editItem.id}`,
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                Busy.set(false);
                if (data) {
                    let selectedAssetType = assetTypes.find(function (assetType) {
                        return assetType.key === data.assetType;
                    });
                    this.setState({
                        assetTypes: assetTypes,
                        id: data.id ? data.id : '',
                        locationId: data.locationId ? data.locationId : '',
                        assetType: selectedAssetType ? new ReferenceOption(selectedAssetType.key, selectedAssetType.value) : '',
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
                    });
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });

    };

    handleFailure(jqXHR, textStatus, errorThrown) {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;
        toast.error(errorMessage);
    }

    handleFieldChange = event => {
        this.setState({[event.target.name]: event.target.value.toUpperCase()});
    };

    handleContainerIdFieldChange = containerNumber => {
        this.setState({containerNumber: containerNumber});
    };

    saveChanges = () => {

        this.setState({errorMessage: ''});

        Busy.set(true);

        $.ajax({
            url: 'api/inventory',
            data: JSON.stringify({
                id: this.state.id,
                locationId: this.state.locationId,
                containerNumber: this.state.containerNumber,
                chassisNumber: this.state.chassisNumber,
                chassisLicensePlateNumber: this.state.chassisLicensePlateNumber,
                sealNumber: this.state.sealNumber,
                driverFirstName: this.state.driverFirstName,
                driverLastName: this.state.driverLastName,
                driverLicenseNumber: this.state.driverLicenseNumber,
                truckLicensePlateNumber: this.state.truckLicensePlateNumber,
                notes: this.state.notes,
                assetSize: this.state.assetSize,
                assetType: this.state.assetType.value
            }),
            type: 'PUT',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {
                Busy.set(false);
                this.props.handlePostSaveEvent();
                toast.success('Successfully saved inventory changes!');
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });


    };

    handleAssetTypeChange = event => {
        let assetType = event.target.value;
        this.setState({assetType: assetType});
    };

    render() {


        return (
            <form className="ss-form ss-block no-padding">
                <div className="modal-body">
                    <div>
                        <fieldset className="ss-stand-alone">
                            <label>ASSET TYPE</label>
                            <Select id="assetType"
                                    name="assetType"
                                    optionsWidth="300px"
                                    className="ss-book-space-form-asset-type"
                                    handleChange={this.handleAssetTypeChange}
                                    selectedOption={this.state.assetType}
                                    placeholder="Select the equipment type being checked in"
                                    options={this.state.assetTypes.map(item => new ReferenceOption(item.key, item.value))}
                            />
                        </fieldset>
                    </div>
                    <div>
                        <ContainerEntryField className="ss-top"
                                             valueCallback={this.handleContainerIdFieldChange}
                                             initState={this.state.containerNumber}
                        />
                        <fieldset className="ss-middle">
                            <label>ASSET SIZE</label>
                            <Select id="assetSize"
                                    name="assetSize"
                                    className="ss-book-space-form-asset-size"
                                    handleChange={this.handleFieldChange}
                                    selectedOption={this.state.assetSize}
                                    placeholder="Choose"
                                    options={["20", "40", "45", "53"]}
                            />
                        </fieldset>
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
                </div>
                <div className="modal-footer">
                    <div className="table text-center">
                        <button type="button" className="ss-button-secondary"
                                onClick={() => this.saveChanges()}>Save
                        </button>
                        <button type="button" className="ss-button-primary"
                                onClick={() => this.props.handlePanelCloseEvent()}>Cancel
                        </button>
                    </div>
                </div>
            </form>
        )

    }
}