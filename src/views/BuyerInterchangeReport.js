import React, { Component } from "react";
import moment from "moment";
import AccountReport from "./AccountReport";

const GALLERY_BUCKET = "inventory";
class BuyerInterchangeReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
        };
    }

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

    handleSubPanelCloseEvent = (event) => {
        this.setState({
            viewImages: null,
        });
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account) {
            this.setState({ account: nextProps.account });
        }
    }

    printInterchange = (item) => {
        if (item) {
            window.open("http://localhost:8081/api/interchanges/" + item.id);
        }
    };

    getReportDataUrl = (account, startDate, endDate) => {
        this.setState({ startDate: startDate, endDate: endDate });

        return (
            `api/buyers/${account.id}/inventory-activity-report?startDate=` +
            startDate +
            "&endDate=" +
            endDate
        );
    };

    render() {
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
        return (
            <div className="flex h-100">
                <AccountReport
                    title="Interchanges"
                    getReportDataUrl={this.getReportDataUrl}
                    defaultGroupBy="locationName"
                    defaultSortBy="activityDate"
                    defaultSortByDirection="DESC"
                    defaultDaysInDateRange={30}
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
                                return moment(new Date(value)).format(
                                    "MM/DD/YYYY hh:mm A"
                                );
                            },
                        },
                        {
                            label: "Container",
                            name: "containerNumber",
                        },
                        {
                            label: "Trailer",
                            name: "trailerNumber",
                            formatter: (value) => {
                                return value ? value + "999" : "";
                            },
                        },
                        {
                            label: "Chassis",
                            name: "chassisNumber",
                        },
                        {
                            label: "CHASSIS LICENSE #",
                            name: "chassisLicensePlateNumber",
                        },
                        {
                            label: "Size",
                            name: "assetSize",
                            formatter: (value) => `${value}ft`,
                        },
                        {
                            label: "First Name",
                            name: "driverFirstName",
                        },
                        {
                            label: "Last Name",
                            name: "driverLastName",
                        },
                        {
                            label: "License",
                            name: "driverLicenseNumber",
                        },
                        {
                            label: "Seal",
                            name: "sealNumber",
                        },
                        {
                            label: "TYPE",
                            name: "assetType",
                        },
                        {
                            label: "Booking",
                            name: "orderNumber",
                        },
                        {
                            label: "LOCATION",
                            name: "locationName",
                        },
                        {
                            label: "PARTNER",
                            name: "supplierName",
                        },
                        {
                            label: "Inventory",
                            name: "currentInventory",
                        },
                        {
                            label: "DWELL TIME",
                            name: "dwellTimeDisplayString",
                            shouldShowField: (item) =>
                                !!item.dwellTimeDisplayString,
                        },
                    ]}
                    account={this.state.account}
                    actionList={[
                        {
                            displayValue: "Print...",
                            action: this.printInterchange,
                        },
                        {
                            displayValue: "View Images",
                            action: this.viewImages,
                            shouldShowAction: (item) => {
                                return (
                                    item.inventoryGallery &&
                                    item.inventoryGallery.length > 0
                                );
                            },
                        },
                    ]}
                    reloadOnDateChange={true}
                />
                {this.state.viewImages ? viewImages : ""}
            </div>
        );
    }
}

export default BuyerInterchangeReport;
