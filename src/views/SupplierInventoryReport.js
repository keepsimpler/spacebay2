import React, {Component} from 'react';
import AccountReport from "./AccountReport";
import EditInventory from "../components/EditInventory";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "../components/Busy";
import CheckOutForm from "../components/CheckOutForm";
import ModalDialog from "../components/ModalDialog";

import ConfirmDialogBlock from "../components/ConfirmDialogBlock";
import {toast} from "react-toastify";
import URLUtils from "../util/URLUtils";
import { validateContainerNumber } from "../util/ContainerValidator";

const $ = window.$;

export default class SupplierInventoryReport extends Component {
    constructor(props) {
        super(props);

        let initialSearchText = URLUtils.getQueryVariable('equipmentNumber');
        if (!initialSearchText) {
            initialSearchText = '';
        }

        this.state = {
            account: this.props.account,
            editItem: null,
            checkOutItem: null,
            showCancelConfirmation: false,
            initialSearchText: initialSearchText
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account) {
            this.setState({account: nextProps.account});
            this.loadReportData(nextProps.account)
        }
    }

    componentDidMount() {
        this.loadReportData(this.props.account);
    }

    loadReportData = account => {

        if (account && account.id) {
            Busy.set(true);
            $.ajax({
                url: `api/suppliers/${account.id}/inventory-report`,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                success: this.handleSuccess,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.handleFailure
            });
        }

    };

    handleSuccess = data => {
        Busy.set(false);
        this.setState({reportList: data});
    };

    handleFailure = data => {
        Busy.set(false);
    };

    editInventoryItem = item => {

        this.setState({
            editItem: item,

        })

    };

    handleSubPanelCloseEventDialog = () => {
        this.setState({
            showCancelConfirmation: true
        });
    };

    handleSubPanelCloseEvent = event => {
        this.setState({
            editItem: null,
            checkOutItem: null,
            showCancelConfirmation: false
        });
    };

    handlePostSaveEvent = event => {
        this.setState({
            editItem: null,
        });

        this.loadReportData(this.state.account);

    };

    checkOutAsset = item => {

        this.setState({
            checkOutItem: item
        })

    };

    checkOutCompletedCallback = () => {
        this.setState({
            checkOutItem: null
        });

        toast.success("Successfully checked out!");

        this.loadReportData(this.state.account);

    };

    render() {

        let actionList;
        if (this.props.account.userType === 'GATECLERK') {
            actionList = [
                {
                    displayValue: 'Check Out',
                    action: this.checkOutAsset
                }
            ];
        } else {
            actionList = [
                {
                    displayValue: 'Check Out',
                    action: this.checkOutAsset
                },
                {
                    displayValue: 'Edit',
                    action: this.editInventoryItem
                }
            ];
        }
        let mainReport =
            <AccountReport title="Current Inventory"
                           parentMenu="Gate Management"
                           data={this.state.reportList}
                           defaultSortBy="checkInDate"
                           defaultSortByDirection="DESC"
                           defaultDaysInDateRange={30}
                           visibleRecordBatchSize={20}
                           criteriaField="locationName"
                           initialSearchText={this.state.initialSearchText}
                           reportFields={[
                               {
                                   label: "CHECK IN",
                                   name: "checkInDate"
                               },
                               {
                                   label: "CONTAINER",
                                   name: "containerNumber"
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
                                   name: "trailerNumber"
                               },
                               {
                                   label: "CHASSIS",
                                   name: "chassisNumber"
                               },
                               {
                                   label: "CHASSIS LICENSE PLATE",
                                   name: "chassisLicensePlateNumber"
                               },
                               {
                                   label: "SIZE",
                                   name: "assetSize",
                                   formatter: value => value ? `${value}ft` : ''
                               },
                               {
                                   label: "SEAL",
                                   name: "sealNumber"
                               },
                               {
                                   label: "TYPE",
                                   name: "assetType",
                                   formatter: (value) => {
                                       return value === 'CONTAINER_LOADED' ?
                                           "Container / Chassis (Loaded)"
                                           :
                                           value === 'CONTAINER_EMPTY' ?
                                               "Container / Chassis (Empty)"
                                               :
                                               value === 'CHASSIS_ONLY' ?
                                                   "Chassis Only"
                                                   :
                                                   value === 'TRUCK_CONTAINER_LOADED' ?
                                                       "Truck + Container / Chassis (Loaded)"
                                                       :
                                                       value === 'TRUCK_CONTAINER_EMPTY' ?
                                                           "Truck + Container / Chassis (Empty)"
                                                           :
                                                           value === 'TRUCK_TRAILER_LOADED' ?
                                                               "Truck + Trailer (Loaded)"
                                                               :
                                                               value === 'TRUCK_TRAILER_EMPTY' ?
                                                                   "Truck + Trailer (Empty)"
                                                                   :
                                                                   value === 'TRUCK_ONLY' ?
                                                                       "Truck Only"
                                                                       :
                                                                       value === 'TRAILER_LOADED' ?
                                                                           "Trailer (Loaded)"
                                                                           :
                                                                           value === 'TRAILER_EMPTY' ?
                                                                               "Trailer (Empty)"
                                                                               :
                                                                               value === 'REEFER_LOADED_PLUGIN' ?
                                                                                   "Refrigerated (Loaded) (Plug In)"
                                                                                   :
                                                                                   value === 'REEFER_LOADED_NO_PLUGIN' ?
                                                                                       "Reefer (Loaded) (No Plug In)"
                                                                                       :
                                                                                       value === 'TRUCK_REEFER_LOADED_PLUGIN' ?
                                                                                           "Truck + Reefer (Loaded) (Plug In)"
                                                                                           :
                                                                                           value === 'TRUCK_REEFER_LOADED_NO_PLUGIN' ?
                                                                                               "Truck + Reefer (Loaded) (No Plug In)"
                                                                                               :
                                                                                               value;
                                   }
                               },
                               {
                                   label: "BOOKING",
                                   name: "orderNumber"
                               },
                               {
                                   label: "CUSTOMER",
                                   name: "buyerName"
                               },
                               {
                                   label: "LOCATION",
                                   name: "locationName"
                               },
                               {
                                   label: "FIRST NAME",
                                   name: "driverFirstName"
                               },
                               {
                                   label: "LAST NAME",
                                   name: "driverLastName"
                               },
                               {
                                   label: "LICENSE",
                                   name: "driverLicenseNumber"
                               },
                               {
                                   label: "TRUCK LICENSE PLATE NUMBER",
                                   name: "truckLicensePlateNumber"
                               },
                           ]}
                           account={this.state.account}
                           actionList={
                               actionList
                           }
            />;

        let editView =
            <ModalDialog dialogClass="modal fade show" title="Edit Inventory Asset"
                         handleCloseEvent={this.handleSubPanelCloseEvent}>
                <EditInventory handlePanelCloseEvent={this.handleSubPanelCloseEvent}
                               editItem={this.state.editItem}
                               handlePostSaveEvent={this.handlePostSaveEvent}
                />
            </ModalDialog>;

        let checkOutView =
            <ModalDialog dialogClass="modal fade show z-index-999"
                         subtitle={this.state.checkOutItem ? this.state.checkOutItem.buyerName : null}
                         title="Check Out Asset" handleCloseEvent={this.handleSubPanelCloseEventDialog}>
                <CheckOutForm
                    inventory={this.state.checkOutItem}
                    closeSubViewHandler={this.handleSubPanelCloseEventDialog}
                    checkOutCompletedCallback={this.checkOutCompletedCallback}
                />

            </ModalDialog>;


        return (
            <div className="h-100">
                <ConfirmDialogBlock
                    showAlert={this.state.showCancelConfirmation}
                    title="Confirmation"
                    onClose={() => {
                        this.setState({showCancelConfirmation: false})
                    }}
                    proceedEventHandler={this.handleSubPanelCloseEvent}>
                    Are you sure you want to cancel?
                </ConfirmDialogBlock>
                {this.state.editItem ? editView : ''}
                {this.state.checkOutItem ? checkOutView : ''}
                {mainReport}
            </div>
        );
    }
}
