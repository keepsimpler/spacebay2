import React, {Component} from 'react';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import Error from "../components/Error";
import DropGallery from "../components/DropGallery";
import {
    generateInitialStateFromCustomCheckinConfiguration,
    validateCustomCheckInConfiguration
} from "./checkin/util/check-in-validation-util";
import OCREnabledField from "./checkin/component/OCREnabledField";
import OCREnabledAssetField from "./checkin/component/OCREnabledAssetField";
import OCREngine from "../util/OCREngineUtil";
import BarCodeScannerEnabledField from "./checkin/component/BarCodeScannerEnabledField";
import {AppContext} from "../context/app-context";

class TrailerEmptyCheckInForm extends Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);

        this.state = {
            errorMessage: '',
            trailerNumber: '',
            driverFirstName: '',
            driverLastName: '',
            driverLicenseNumber: '',
            truckLicensePlateNumber: '',
            notes: '',
            assetSize: '',
            ...generateInitialStateFromCustomCheckinConfiguration(this.props.customFields)
        }
    }

    updateDropzone = dropzone => {
        this.dropzone = dropzone;
    };

    handleFieldChange = event => {
        this.setState({[event.target.name]: event.target.value.toUpperCase()});
    };

    validateDefaultConfig = () => {
        if (!this.props.assetType && !this.props.assetType.value) {
            return "Please select an equipment type."
        }

        if (!this.state.trailerNumber) {
            return "Please enter a trailer number."
        }

        if (!this.state.driverFirstName) {
            return "Please enter the driver's first name."
        }

        if (!this.state.driverLastName) {
            return "Please enter the driver's last name."
        }

        if (!this.state.assetSize) {
            return "Please enter an asset size."
        }
    }

    readBarcodeResults = (results) => {
        let fields = OCREngine.setDriversLicenseFields(results);
        let firstName = fields.firstName;
        let lastName = fields.lastName;
        let driversLicense = fields.driversLicense;

        this.setState({driverFirstName: firstName, driverLastName: lastName, driverLicenseNumber: driversLicense})
    }

    checkInAsset = () => {

        this.setState({errorMessage: ''});

        let errorMessage

        if (this.props.customFields && this.props.customFields.length > 0) {
            const clonedState = {...this.state}
            errorMessage = validateCustomCheckInConfiguration(clonedState, this.props.customFields)
        } else {
            errorMessage = this.validateDefaultConfig()
        }

        if (errorMessage) {
            this.setState({errorMessage})
            return
        }

        this.props.handleFormSave({
            trailerNumber: this.state.trailerNumber,
            driverFirstName: this.state.driverFirstName,
            driverLastName: this.state.driverLastName,
            driverLicenseNumber: this.state.driverLicenseNumber,
            truckLicensePlateNumber: this.state.truckLicensePlateNumber,
            notes: this.state.notes,
            assetSize: this.state.assetSize,
            assetType: this.props.assetType,
            dropzone: this.dropzone
        });

    };

    render() {

        const {correlationId} = this.props;
        const appContext = this.context;
        const { user } = appContext;

        return (
            <div>
                <OCREnabledAssetField
                    name="assetSize"
                    label="ASSET SIZE"
                    value={this.state.assetSize}
                    onChange={this.handleFieldChange}
                    setText={(text) => this.setState({assetSize: text})}
                    placeholder="Choose"
                    isEnabled={user.rekognitionPrivileges}
                    correlationId={correlationId}
                />
                <OCREnabledField
                    name="trailerNumber"
                    label="TRAILER NUMBER"
                    value={this.state.trailerNumber}
                    onChange={this.handleFieldChange}
                    setText={(text) => this.setState({trailerNumber: text})}
                    placeholder="Enter the trailer number"
                    isEnabled={user.rekognitionPrivileges}
                    correlationId={correlationId}
                />
                <BarCodeScannerEnabledField
                    name="driverLicenseNumber"
                    label="DRIVER LICENCE NUMBER"
                    value={this.state.driverLicenseNumber}
                    onChange={this.handleFieldChange}
                    readScannedResults={this.readBarcodeResults}
                    placeholder="Scan the driver's license number"
                    isEnabled={user.rekognitionPrivileges}
                    correlationId={correlationId}
                />
                <OCREnabledField
                    name="driverFirstName"
                    label="DRIVER'S FIRST NAME"
                    value={this.state.driverFirstName}
                    onChange={this.handleFieldChange}
                    setText={(text) => this.setState({driverFirstName: text})}
                    placeholder="Enter the driver's first name"
                    isEnabled={user.rekognitionPrivileges}
                    correlationId={correlationId}
                />
                <OCREnabledField
                    name="driverLastName"
                    label="DRIVER'S LAST NAME"
                    value={this.state.driverLastName}
                    onChange={this.handleFieldChange}
                    setText={(text) => this.setState({driverLastName: text})}
                    placeholder="Enter the driver's last name"
                    isEnabled={user.rekognitionPrivileges}
                    correlationId={correlationId}
                />
                <OCREnabledField
                    name="truckLicensePlateNumber"
                    label="TRUCK LICENSE PLATE NUMBER"
                    value={this.state.truckLicensePlateNumber}
                    onChange={this.handleFieldChange}
                    setText={(text) => this.setState({truckLicensePlateNumber: text})}
                    placeholder="Enter the truck's license plate number"
                    isEnabled={user.rekognitionPrivileges}
                    correlationId={correlationId}
                />
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

                <br/>
                <p>Click below to add images</p>
                <fieldset className="ss-top ss-dz">
                    <DropGallery bucket={this.props.bucket}
                                 locationGallery={this.state.locationGallery}
                                 locationId={this.state.id}
                                 updateDropzone={this.updateDropzone}

                    />
                </fieldset>
                {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}

                <div className='ss-check-in-button-container'>
                    <button type="button" className="ss-button-primary ss-dialog-button"
                            onClick={() => this.checkInAsset()}>Check In
                    </button>
                    <button type="button" className="ss-button-primary reverse ss-dialog-button"
                            onClick={() => this.props.handlePanelCloseEvent()}>Cancel
                    </button>
                </div>
            </div>
        );
    }
}

export default TrailerEmptyCheckInForm;
