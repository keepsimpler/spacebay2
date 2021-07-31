import React, {Component} from 'react';
import '../css/views/booking-common.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import Error from "./Error";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "./Busy";
import DropGallery from "../components/DropGallery";
import BarCodeScannerEnabledField from "./checkin/component/BarCodeScannerEnabledField";
import OCREngine from "../util/OCREngineUtil";
import {AppContext} from "../context/app-context";
import OCREnabledField from "./checkin/component/OCREnabledField";

const $ = window.$;
const GALLERY_BUCKET = "inventory";

class CheckOutForm extends Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);

        this.state = Object.assign({
            driverLicenseNumber: '',
            driverFirstName: '',
            driverLastName: '',
            truckLicensePlateNumber: '',
            notes: ''
        });

        this.dropzone = null;
    }

    updateDropzone = dropzone => {
        this.dropzone = dropzone;
    };

    closeSubViewHandler = () => {
        this.props.closeSubViewHandler();
    };

    handleFieldChange = event => {
        this.setState({[event.target.name]: event.target.value.toUpperCase()});
    };

    checkOutAsset = () => {
        let _this = this;
        this.setState({errorMessage: ''});

        if (!this.state.driverFirstName) {
            this.setState({errorMessage: "Please enter the driver's first name."});
            return;
        }

        if (!this.state.driverLastName) {
            this.setState({errorMessage: "Please enter the driver's last name."});
            return;
        }

        Busy.set(true);

        $.ajax({
            url: 'api/check-out-images',
            data: JSON.stringify({
                id: this.props.inventory.id,
                bookingId: this.props.inventory.bookingId,
                locationId: this.props.inventory.locationId,
                driverFirstName: this.state.driverFirstName,
                driverLastName: this.state.driverLastName,
                driverLicenseNumber: this.state.driverLicenseNumber,
                truckLicensePlateNumber: this.state.truckLicensePlateNumber,
                notes: this.state.notes,
                correlationId: this.props.inventory.correlationId
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (data) => {

                if (data.id) {
                    if (_this.dropzone && _this.dropzone.files.length > 0) {
                        _this.saveGallery(data);
                    }
                    else {
                        Busy.set(false);
                        _this.props.checkOutCompletedCallback();
                    }
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: () => {
                Busy.set(false);
            }
        });

    };

    saveGallery = checkout => {
        let uploadedGalleryFiles = [];
        this.galleryFiles = [];

        if (this.dropzone && this.dropzone.files.length > 0) {
            for (let i = 0; i < this.dropzone.files.length; i++) {
                let file = this.dropzone.files[i];
                if (file && file.type !== 'fake') {
                    //new file
                    uploadedGalleryFiles.push(file);
                }else{
                    this.galleryFiles.push(file.name);
                }
            }
        }
        this.uploadGallery(this, uploadedGalleryFiles, checkout);
    };

    uploadGallery(_this, uploadedGalleryFiles, checkout) {
        if (!uploadedGalleryFiles || uploadedGalleryFiles.length === 0) {
            _this.updateGalleryTable(checkout);
            return;
        }

        let file = uploadedGalleryFiles.shift();

        if (file && file.name) {

            _this.uploadFileData(GALLERY_BUCKET + '/' + checkout.id, file, function (uploadedFileName, textStatus, jqXHR) {
                _this.galleryFiles.push(uploadedFileName);
                _this.uploadGallery(_this, uploadedGalleryFiles, checkout);
            });
        }
    }

    uploadFileData(folder, file, onSuccess) {
        let _this = this;

        let data = new FormData();
        data.append('inputStream', file.dataURL);
        let time = new Date().getTime();
        let profileFileName =  time + '_' + file.name;
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

    updateGalleryTable(checkout) {
        let _this = this;
        // save files names in gallery table and delete???

        $.ajax({
            url: 'api/gallery-check-out',
            data: JSON.stringify({
                activity: checkout,
                galleryFiles: this.galleryFiles
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: (data) => {
                Busy.set(false);
                _this.props.checkOutCompletedCallback();
            },
            statusCode: {
                 401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: () => {
                Busy.set(false);
            }
        });

    }

    readBarcodeResults = (results) => {
        let fields = OCREngine.setDriversLicenseFields(results);
        let firstName = fields.firstName;
        let lastName = fields.lastName;
        let driversLicense = fields.driversLicense;

        this.setState({driverFirstName: firstName, driverLastName: lastName, driverLicenseNumber: driversLicense})
    }

    render() {

        const appContext = this.context;
        const { user } = appContext;

        return (
            <div>
                <form className="ss-form ss-block no-padding">
                    <div className="modal-body">
                        <div>

                            <table className="table">
                                <tbody>
                                <tr>
                                    <td><strong>Container Number:</strong></td>
                                    <td>{this.props.inventory.containerNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Trailer Number:</strong></td>
                                    <td>{this.props.inventory.trailerNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Chassis Number:</strong></td>
                                    <td>{this.props.inventory.chassisNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Chassis License <br/>Plate Number:</strong></td>
                                    <td>{this.props.inventory.chassisLicensePlateNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Seal Number:</strong></td>
                                    <td>{this.props.inventory.sealNumber}</td>
                                </tr>
                                <tr>
                                    <td><strong>Equipment Type:</strong></td>
                                    <td>{this.props.inventory.assetType}</td>
                                </tr>
                                <tr>
                                    <td><strong>Asset Size:</strong></td>
                                    <td>{this.props.inventory.assetSize}</td>
                                </tr>
                                <tr>
                                    <td><strong>Check In Date:</strong></td>
                                    <td>{this.props.inventory.checkInDate}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <OCREnabledField
                                name="driverFirstName"
                                label="DRIVER'S FIRST NAME"
                                value={this.state.driverFirstName}
                                onChange={this.handleFieldChange}
                                setText={(text) => this.setState({driverFirstName: text})}
                                placeholder="Enter the driver's first name"
                                isEnabled={user.rekognitionPrivileges}
                                correlationId={this.props.inventory.correlationId}
                            />
                            <OCREnabledField
                                name="driverLastName"
                                label="DRIVER'S LAST NAME"
                                value={this.state.driverLastName}
                                onChange={this.handleFieldChange}
                                setText={(text) => this.setState({driverLastName: text})}
                                placeholder="Enter the driver's last name"
                                isEnabled={user.rekognitionPrivileges}
                                correlationId={this.props.inventory.correlationId}
                            />
                            <BarCodeScannerEnabledField
                                name="driverLicenseNumber"
                                label="DRIVER LICENCE NUMBER"
                                value={this.state.driverLicenseNumber}
                                onChange={this.handleFieldChange}
                                readScannedResults={this.readBarcodeResults}
                                placeholder="Scan the driver's license number"
                                isEnabled={user.rekognitionPrivileges}
                            />
                            <OCREnabledField
                                name="truckLicensePlateNumber"
                                label="TRUCK LICENSE PLATE NUMBER"
                                value={this.state.truckLicensePlateNumber}
                                onChange={this.handleFieldChange}
                                setText={(text) => this.setState({truckLicensePlateNumber: text})}
                                placeholder="Enter the truck license plate number"
                                isEnabled={user.rekognitionPrivileges}
                                correlationId={this.props.inventory.correlationId}
                            />
                            <fieldset className="ss-middle">
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
                        <br/>
                        <p>Click below to add images</p>
                        <fieldset className="ss-top ss-dz">
                            <DropGallery bucket={GALLERY_BUCKET}
                                         locationGallery={this.state.locationGallery}
                                         locationId={this.state.id}
                                         updateDropzone={this.updateDropzone}

                            />
                        </fieldset>
                    </div>
                    <div className="modal-footer">
                        <div className="ss-check-in-button-container text-center">
                            <button type="button" className="ss-button-secondary ss-dialog-button"
                                    onClick={() => this.checkOutAsset()}>
                                Check Out
                            </button>
                            <button type="button" className="ss-button-primary  ss-dialog-button"
                                    onClick={this.props.closeSubViewHandler}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>

            </div>

        );
    }
}

export default CheckOutForm;