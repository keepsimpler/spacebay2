import React, { Component } from "react";
import "../css/views/booking-common.css";
import "../css/theme/mainContent.css";
import "../css/theme/forms.css";
import "../css/theme/forms-block.css";
import "../css/theme/buttons.css";
import "../css/components/checkInParentControl.css";
import Select from "../components/Select";
import { createLogoutOnFailureHandler } from "../util/LogoutUtil";
import ReferenceOption from "../controls/ReferenceOption";
import LoadedContainerCheckInForm from "./LoadedContainerCheckInForm";
import EmptyContainerCheckInForm from "./EmptyContainerCheckInForm";
import ChassisOnlyCheckInForm from "./ChassisOnlyCheckInForm";
import TrailerLoadedCheckInForm from "./TrailerLoadedCheckInForm";
import TrailerEmptyCheckInForm from "./TrailerEmptyCheckInForm";
import TruckOnlyCheckInForm from "./TruckOnlyCheckInForm";
import { requestCheckInFieldsForAccountId } from "./checkin/request/check-in-requests";
import Busy from "./Busy";
import { toast } from "react-toastify";
import { correlationIdRequest } from "./checkin/request/correlationId-request";

const $ = window.$;
const GALLERY_BUCKET = "inventory";

class CheckInParentControl extends Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({
            assetType: "",
            errorMessage: "You have an error!",
            correlationId: "",
            checkInId: "",
        });

        this.dropzone = null;
        this.equipmentDataErrorMessage = null;
        this.apiPromiseResolver();
    }

    apiPromiseResolver = () => {
        const { accountId } = this.props;
        const promise1 = requestCheckInFieldsForAccountId(accountId);
        const promise2 = correlationIdRequest();
        Promise.allSettled([promise1, promise2]).then(([p1, p2]) => {
            try {
                this.processCheckInFields(p1.value.body);
                this.processCorrelationId(p2.value.body);
            } catch(error) {
                toast.error("There was an error loading Checkin Form");
                this.props.closeFormHandler();
            }
        }).then(
            Busy.set(false)
        );
    }

    processCorrelationId = (correlationId) => {
        this.setState({ correlationId: correlationId });
    };

    processCheckInFields = (fields) => {
        this.setState({ fieldMap: fields });
    };

    handleRequestCheckInFieldsError = (errorMsg) => {
        Busy.set(false);
        this.setState({ errorMsg });
    };

    saveGallery = (checkout) => {
        let uploadedGalleryFiles = [];
        this.galleryFiles = [];
        if (this.dropzone && this.dropzone.files.length > 0) {
            for (let i = 0; i < this.dropzone.files.length; i++) {
                let file = this.dropzone.files[i];
                if (file && file.type !== "fake") {
                    //new file
                    uploadedGalleryFiles.push(file);
                } else {
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

        // why make this function recur?????????????????
        let file = uploadedGalleryFiles.shift();

        if (file && file.name) {
            _this.uploadFileData(
                GALLERY_BUCKET + "/" + checkout.id,
                file,
                function (uploadedFileName, textStatus, jqXHR) {
                    _this.galleryFiles.push(uploadedFileName);
                    _this.uploadGallery(_this, uploadedGalleryFiles, checkout);
                }
            );
        }
    }

    uploadFileData(folder, file, onSuccess) {
        let _this = this;

        let data = new FormData();
        data.append("inputStream", file.dataURL);
        let time = new Date().getTime();
        let profileFileName = time + "_" + file.name;
        $.ajax({
            url:
                "/api/file/upload-data?folder=" +
                folder +
                "&name=" +
                profileFileName +
                "&contentType=" +
                file.type,
            type: "POST",
            data: data,
            cache: false,
            processData: false, // Don't process the files
            contentType: false, // Set content type to false as jQuery will tell the server its a query string request
            success: function (data, textStatus, jqXHR) {
                onSuccess(data, textStatus, jqXHR);
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout),
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Busy.set(false);
                _this.setState({
                    errorMessage: "File upload failed:  " + textStatus,
                });
            },
        });
    }

    updateGalleryTable(checkout) {
        // save files names in gallery table and delete???

        $.ajax({
            url: "api/gallery-check-out",
            data: JSON.stringify({
                activity: checkout,
                galleryFiles: this.galleryFiles,
            }),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            success: (data) => {
                Busy.set(false);
                this.props.saveCompletedCallback();
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout),
            },
            error: () => {
                Busy.set(false);
            },
        });
    }

    componentDidMount() {
        this.assetTypesList();
    }

    assetTypesList = () => {
        // if (typesForBooking.length === 0) return null;

        let tempTypes = this.props.assetTypes;
        //     .filter(item => {
        //     return typesForBooking[0].type.indexOf(item.key) > -1
        // })
        let options = tempTypes.map((item) => {
            return new ReferenceOption(item.key, item.value);
        });
        this.setState({ options: options });
    };

    saveCheckInForm = (formValues) => {
        if (typeof formValues.dropzone !== "undefined") {
            this.dropzone = formValues.dropzone;
        } else {
            this.dropzone = null;
        }
        Busy.set(true);

        $.ajax({
            url: "api/check-in-images",
            data: JSON.stringify({
                bookingId: this.props.booking.id,
                locationId: this.props.booking.location.id,
                buyerId: this.props.booking.buyerAccount.id,
                containerNumber: formValues.containerNumber,
                trailerNumber: formValues.trailerNumber,
                chassisNumber: formValues.chassisNumber,
                chassisLicensePlateNumber: formValues.chassisLicensePlateNumber,
                sealNumber: formValues.sealNumber,
                driverFirstName: formValues.driverFirstName,
                driverLastName: formValues.driverLastName,
                driverLicenseNumber: formValues.driverLicenseNumber,
                truckLicensePlateNumber: formValues.truckLicensePlateNumber,
                notes: formValues.notes,
                assetSize: formValues.assetSize,
                assetType: formValues.assetType.value,
                equipmentDataErrorMessage: this.equipmentDataErrorMessage,
                correlationId: this.state.correlationId,
            }),
            type: "POST",
            contentType: "application/json; charset=UTF-8",
            dataType: "json",
            success: (data) => {
                if (data.id) {
                    if (this.dropzone && this.dropzone.files.length > 0) {
                        this.saveGallery(data);
                    } else {
                        Busy.set(false);
                        this.props.saveCompletedCallback();
                    }
                }
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout),
            },
            error: this.handleFailure,
        });
    };

    closeSubViewHandler = () => {
        this.props.closeSubViewHandler();
    };

    handlePanelCloseEvent = () => {
        this.props.closeSubViewHandler();
    };

    handleFailure(jqXHR, textStatus, errorThrown) {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON
            ? jqXHR.responseJSON.message
            : "Internal Server Error";
        errorMessage = errorMessage ? errorMessage.trim() : errorMessage;

        if (
            errorMessage.startsWith(
                "ERROR: duplicate key value violates unique constraint"
            )
        ) {
            errorMessage = "Equipment already exists in Inventory!";
        }

        toast.error(errorMessage);
    }

    handleEquipmentError = (errorMessage) => {
        this.equipmentDataErrorMessage = errorMessage;
    };

    handleEquipmentErrorCleared = () => {
        this.equipmentDataErrorMessage = null;
    };

    handleAssetTypeChange = (event) => {
        let assetType = event.target.value;
        this.setState({ assetType: assetType });
        if (
            assetType.getValue() === "CONTAINER_LOADED" ||
            assetType.getValue() === "TRUCK_CONTAINER_LOADED"
        ) {
            this.setState({
                formComponentsView: (
                    <LoadedContainerCheckInForm
                        gallery={GALLERY_BUCKET}
                        booking={this.props.booking}
                        handlePanelCloseEvent={this.handlePanelCloseEvent}
                        handleFormSave={this.saveCheckInForm}
                        assetType={assetType}
                        handleEquipmentError={this.handleEquipmentError}
                        handleEquipmentErrorCleared={
                            this.handleEquipmentErrorCleared
                        }
                        customFields={this.state.fieldMap}
                        correlationId={this.state.correlationId}
                    />
                ),
            });
        } else if (
            assetType.getValue() === "CONTAINER_EMPTY" ||
            assetType.getValue() === "TRUCK_CONTAINER_EMPTY"
        ) {
            this.setState({
                formComponentsView: (
                    <EmptyContainerCheckInForm
                        gallery={GALLERY_BUCKET}
                        booking={this.props.booking}
                        handlePanelCloseEvent={this.handlePanelCloseEvent}
                        handleFormSave={this.saveCheckInForm}
                        assetType={assetType}
                        handleEquipmentError={this.handleEquipmentError}
                        handleEquipmentErrorCleared={
                            this.handleEquipmentErrorCleared
                        }
                        customFields={this.state.fieldMap}
                        correlationId={this.state.correlationId}
                    />
                ),
            });
        } else if (assetType.getValue() === "CHASSIS_ONLY") {
            this.setState({
                formComponentsView: (
                    <ChassisOnlyCheckInForm
                        gallery={GALLERY_BUCKET}
                        booking={this.props.booking}
                        handlePanelCloseEvent={this.handlePanelCloseEvent}
                        handleFormSave={this.saveCheckInForm}
                        assetType={assetType}
                        customFields={this.state.fieldMap}
                        correlationId={this.state.correlationId}
                    />
                ),
            });
        } else if (
            assetType.getValue() === "TRUCK_TRAILER_LOADED" ||
            assetType.getValue() === "TRAILER_LOADED" ||
            assetType.getValue() === "REEFER_LOADED_NO_PLUGIN" ||
            assetType.getValue() === "TRUCK_REEFER_LOADED_PLUGIN" ||
            assetType.getValue() === "TRUCK_REEFER_LOADED_NO_PLUGIN" ||
            assetType.getValue() === "REEFER_LOADED_PLUGIN"
        ) {
            this.setState({
                formComponentsView: (
                    <TrailerLoadedCheckInForm
                        gallery={GALLERY_BUCKET}
                        booking={this.props.booking}
                        handlePanelCloseEvent={this.handlePanelCloseEvent}
                        handleFormSave={this.saveCheckInForm}
                        assetType={assetType}
                        customFields={this.state.fieldMap}
                        correlationId={this.state.correlationId}
                    />
                ),
            });
        } else if (
            assetType.getValue() === "TRUCK_TRAILER_EMPTY" ||
            assetType.getValue() === "TRAILER_EMPTY"
        ) {
            this.setState({
                formComponentsView: (
                    <TrailerEmptyCheckInForm
                        gallery={GALLERY_BUCKET}
                        booking={this.props.booking}
                        handlePanelCloseEvent={this.handlePanelCloseEvent}
                        handleFormSave={this.saveCheckInForm}
                        assetType={assetType}
                        customFields={this.state.fieldMap}
                        correlationId={this.state.correlationId}
                    />
                ),
            });
        } else if (assetType.getValue() === "TRUCK_ONLY") {
            this.setState({
                formComponentsView: (
                    <TruckOnlyCheckInForm
                        gallery={GALLERY_BUCKET}
                        booking={this.props.booking}
                        handlePanelCloseEvent={this.handlePanelCloseEvent}
                        handleFormSave={this.saveCheckInForm}
                        assetType={assetType}
                        customFields={this.state.fieldMap}
                        correlationId={this.state.correlationId}
                    />
                ),
            });
        } else {
            this.setState({ formComponentsView: null });
        }
    };

    render() {
        return (
            <div>
                <div className="popup-header">
                    <img
                        alt=""
                        src="https://s3-us-west-1.amazonaws.com/securspace-files/app-images/login.png"
                    />
                    <div>
                        <h1 className="w100">Check In Asset</h1>
                        <h4 className="blue-txt">
                            {this.props.booking.buyerAccount.companyName}
                        </h4>
                    </div>
                    <button
                        type="button"
                        className="close pull-right"
                        aria-label="Close"
                        onClick={this.props.closeSubViewHandler}
                    >
                        <img alt="" src="../app-images/close.png" />
                    </button>
                </div>

                <div className="ss-check-in-parent-container">
                    <form className="ss-form ss-block">
                        <div className="checkin-selector">
                            <label>ASSET TYPE</label>
                            {this.state.options ? (
                                <Select
                                    id="assetType"
                                    name="assetType"
                                    className="ss-book-space-form-asset-type"
                                    optionsWidth="300px"
                                    handleChange={this.handleAssetTypeChange}
                                    selectedOption={this.state.assetType}
                                    placeholder="Select the equipment type being checked in"
                                    options={this.state.options}
                                />
                            ) : null}
                        </div>
                        {this.state.formComponentsView
                            ? this.state.formComponentsView
                            : ""}
                    </form>
                </div>
            </div>
        );
    }
}

export default CheckInParentControl;
