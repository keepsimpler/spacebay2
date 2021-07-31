import React, { Component } from "react";
import moment from "moment";
import AccountReport from "./AccountReport";
import EditInterchange from "../components/EditInterchange";
import Busy from "../components/Busy";
import { createLogoutOnFailureHandler } from "../util/LogoutUtil";
import MoveAsset from "../components/MoveAsset";
import "../css/components/ssDialog.css";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "react-toastify";
import { validateContainerNumber } from "../util/ContainerValidator";

const $ = window.$;
const GALLERY_BUCKET = "inventory";

class SupplierInterchangeReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            editItem: "",
            startDate: null,
            endDate: null,
            showDeleteConfirmation: false,
            interchangeBeingDeleted: null,
            reloadData: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account) {
            this.setState({ account: nextProps.account });
        }
    }

    componentDidMount() {
        $(".fancybox").fancybox({
            padding: 0,
            arrows: true,
            nextClick: true,
            autoPlay: false,
            playSpeed: 1500,
            openEffect: "elastic",
            openSpeed: "slow",
            closeEffect: "fade",
            closeSpeed: "fast",
            nextEffect: "elastic",
            nextSpeed: "slow",
            closeBtn: true,
        });
    }

    getReportDataUrl = (account, startDate, endDate) => {
        return (
            `api/suppliers/${account.id}/inventory-activity-report?startDate=` +
            startDate +
            "&endDate=" +
            endDate
        );
    };

    startDeleteInterchange = (interchange) => {
        this.setState({
            showDeleteConfirmation: true,
            interchangeBeingDeleted: interchange,
        });
    };

    cancelDeleteInterchange = () => {
        Busy.set(false);
        this.setState({
            showDeleteConfirmation: false,
            interchangeBeingDeleted: null,
        });
    };

    deleteInterchange = () => {
        Busy.set(true);
        $.ajax({
            url:
                "api/inventory-activity/" +
                this.state.interchangeBeingDeleted.id,
            type: "DELETE",
            success: this.handleDeleteInterchangeSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout),
            },
            error: this.handleDeleteInterchangeFailure,
        });
    };

    handleDeleteInterchangeSuccess = () => {
        this.setState({
            showDeleteConfirmation: false,
            interchangeBeingDeleted: null,
            reloadData: true,
        });

        Busy.set(false);
        toast.success("Successfully deleted interchange.");
    };

    handleDeleteInterchangeFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({
            showDeleteConfirmation: false,
            interchangeBeingDeleted: null,
        });
        let errorMessage = jqXHR.responseJSON
            ? jqXHR.responseJSON.message
            : "An error occurred while attempting to delete this interchange";

        toast.error(errorMessage);
    };

    printInterchange = (item) => {
        if (item) {
            window.open(
                this.props.account.baseUrl + "/api/interchanges/" + item.id
            );
        }
    };

    editInventoryItem = (item) => {
        this.setState({
            editItem: item,
        });
    };

    viewImages = (item) => {
        this.setState({
            viewImages: item,
        });
    };

    getUrl(item, id) {
        return (
            "https://s3-us-west-1.amazonaws.com/securspace-files/" +
            GALLERY_BUCKET +
            "/" +
            id +
            "/" +
            item.galleryImageFileName
        );
    }

    moveInventoryItem = (item) => {
        this.setState({
            moveItem: item,
        });
    };

    handleSubPanelCloseEvent = (event) => {
        this.setState({
            editItem: null,
            moveItem: null,
            viewImages: null,
        });
    };

    handlePostSaveEvent = (event) => {
        this.setState({
            editItem: null,
            moveItem: null,
            reloadData: true,
        });
    };

    dataReloaded = () => {
        this.setState({ reloadData: false });
    };

    render() {
        let printInterchangesAction = {
            displayValue: "Print...",
            action: this.printInterchange,
        };
        let viewImagesAction = {
            displayValue: "View Images",
            action: this.viewImages,
            shouldShowAction: (item) => {
                return (
                    item.inventoryGallery && item.inventoryGallery.length > 0
                );
            },
        };

        let actionList;
        if (this.props.account.userType === "GATECLERK") {
            actionList = [printInterchangesAction, viewImagesAction];
        } else {
            actionList = [
                printInterchangesAction,
                viewImagesAction,
                {
                    displayValue: "Edit",
                    action: this.editInventoryItem,
                },
                {
                    displayValue: "Move",
                    action: this.moveInventoryItem,
                },
                {
                    displayValue: "Delete",
                    action: this.startDeleteInterchange,
                },
            ];
        }

        let mainReport = (
            <AccountReport
                title="Interchanges"
                parentMenu="Gate Management"
                reloadData={this.state.reloadData}
                dataReloaded={this.dataReloaded}
                defaultSortBy="activityDate"
                defaultSortByDirection="DESC"
                defaultDaysInDateRange={7}
                maxDateRangeInDays={180}
                defaultEndDateIsToday={true}
                visibleRecordBatchSize={20}
                criteriaField="locationName"
                dateField="activityDate"
                reportFields={[
                    {
                        label: "ACTIVITY",
                        name: "activity",
                    },
                    {
                        label: "DATE",
                        name: "activityDate",
                        formatter: (value) => {
                            let formattedDate = moment(new Date(value)).format(
                                "MM/DD/YYYY hh:mm A"
                            );
                            return formattedDate;
                        },
                        groupable: false,
                    },
                    {
                        label: "CONTAINER",
                        name: "containerNumber",
                        groupable: false,
                    },
                    {
                        label: 'CONTAINER VALIDATION',
                        name: 'containerNumberValidation',
                        shouldShowField: (item) => {
                            return item && item.containerNumber
                        },
                        formatter: (value, item) => {
                            const { containerNumber } = item
                            return validateContainerNumber(containerNumber) ? "OK" : "CHECK DIGIT ERROR"
                        },
                        reportValueStyle: "report-value-error",
                        shouldApplyReportValueStyle: (item) => {
                            return !(item && validateContainerNumber(item.containerNumber))
                        }
                    },
                    {
                        label: "TRAILER",
                        name: "trailerNumber",
                        groupable: false,
                    },
                    {
                        label: "CHASSIS",
                        name: "chassisNumber",
                        groupable: false,
                    },
                    {
                        label: "CHASSIS LICENSE #",
                        name: "chassisLicensePlateNumber",
                        groupable: false,
                    },
                    {
                        label: "SIZE",
                        name: "assetSize",
                        formatter: (value) =>
                            value && value !== "null" ? `${value}ft` : "",
                    },
                    {
                        label: "FIRST NAME",
                        name: "driverFirstName",
                        groupable: false,
                    },
                    {
                        label: "LAST NAME",
                        name: "driverLastName",
                        groupable: false,
                    },
                    {
                        label: "LICENSE",
                        name: "driverLicenseNumber",
                        groupable: false,
                    },
                    {
                        label: "TRUCK LICENSE PLATE NUMBER",
                        name: "truckLicensePlateNumber",
                        groupable: false,
                    },
                    {
                        label: "SEAL",
                        name: "sealNumber",
                        groupable: false,
                    },
                    {
                        label: "TYPE",
                        name: "assetType",
                    },
                    {
                        label: "BOOKING",
                        name: "orderNumber",
                    },
                    {
                        label: "CUSTOMER",
                        name: "buyerName",
                    },
                    {
                        label: "LOCATION",
                        name: "locationName",
                    },
                    {
                        label: "INVENTORY",
                        name: "currentInventory",
                        groupable: false,
                    },
                    {
                        label: "DWELL TIME",
                        name: "dwellTimeDisplayString",
                        shouldShowField: (item) =>
                            !!item.dwellTimeDisplayString,
                    },
                    {
                        label: "LAST UPDATE ON",
                        name: "lastUpdatedOn",
                        formatter: (value) => {
                            return value
                                ? moment(new Date(value)).format(
                                      "MM/DD/YYYY hh:mm A"
                                  )
                                : "";
                        },
                        groupable: false,
                    },
                    {
                        label: "LAST UPDATE BY",
                        name: "lastUpdatedBy",
                        groupable: false,
                    },
                    {
                        label: "NOTES",
                        name: "notes",
                        groupable: false,
                    },
                ]}
                account={this.state.account}
                actionList={actionList}
                reloadOnDateChange={true}
                getReportDataUrl={this.getReportDataUrl}
            />
        );

        let editView = (
            <div className="unselectable">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="popup-header">
                            <h1>Edit Interchange</h1>
                            <button
                                type="button"
                                className="close pull-right"
                                aria-label="Close"
                                onClick={this.handleSubPanelCloseEvent}
                            >
                                <img alt="" src="../app-images/close.png" />
                            </button>
                        </div>
                        <EditInterchange
                            handlePanelCloseEvent={
                                this.handleSubPanelCloseEvent
                            }
                            editItem={this.state.editItem}
                            handlePostSaveEvent={this.handlePostSaveEvent}
                        />
                    </div>
                </div>
            </div>
        );

        let viewImages = (
            <div className="unselectable">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="popup-header">
                            <h1>View Images</h1>
                            <button
                                type="button"
                                className="close pull-right"
                                aria-label="Close"
                                onClick={this.handleSubPanelCloseEvent}
                            >
                                <img alt="" src="../app-images/close.png" />
                            </button>
                        </div>
                        <div className="modal-body">
                            {this.state.viewImages &&
                            this.state.viewImages.inventoryGallery.length >
                                0 ? (
                                <ul className="inventory-images">
                                    {this.state.viewImages.inventoryGallery.map(
                                        (item, key) => (
                                            <li key={key}>
                                                <a
                                                    className="fancybox inventory_gallery"
                                                    data-fancybox="inventory_gallery"
                                                    href={this.getUrl(
                                                        item,
                                                        this.state.viewImages.id
                                                    )}
                                                >
                                                    <img
                                                        alt=""
                                                        src={this.getUrl(
                                                            item,
                                                            this.state
                                                                .viewImages.id
                                                        )}
                                                    />
                                                </a>
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        );

        let moveView = (
            <div className="unselectable">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="popup-header">
                            <h1>Move Inventory To Different Booking</h1>
                            <button
                                type="button"
                                className="close pull-right"
                                aria-label="Close"
                                onClick={this.handleSubPanelCloseEvent}
                            >
                                <img alt="" src="../app-images/close.png" />
                            </button>
                        </div>
                        <MoveAsset
                            handlePanelCloseEvent={
                                this.handleSubPanelCloseEvent
                            }
                            moveItem={this.state.moveItem}
                            handlePostSaveEvent={this.handlePostSaveEvent}
                        />
                    </div>
                </div>
            </div>
        );

        return (
            <div className="flex h-100">
                {this.state.editItem ? editView : ""}
                {this.state.moveItem ? moveView : ""}
                {this.state.viewImages ? viewImages : ""}
                {mainReport}
                <ConfirmDialog
                    showAlert={this.state.showDeleteConfirmation}
                    title="Delete Interchange"
                    onClose={this.cancelDeleteInterchange}
                    proceedEventHandler={this.deleteInterchange}
                >
                    Are you sure you want to delete this interchange?
                </ConfirmDialog>
            </div>
        );
    }
}

export default SupplierInterchangeReport;
