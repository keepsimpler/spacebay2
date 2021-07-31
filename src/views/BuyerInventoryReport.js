import React, {Component} from 'react';
import moment from "moment";
import AccountReport from "./AccountReport";
class BuyerInventoryReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account) {
            this.setState({account: nextProps.account});
        }
    }

    render() {
        return (
            <div className="flex h-100">
                <AccountReport title="Current Inventory"
                               getReportDataUrl={(account) => `api/buyers/${account.id}/inventory-report`}
                               defaultGroupBy="locationName"
                               defaultSortBy="checkInDate"
                               defaultSortByDirection="DESC"
                               defaultDaysInDateRange={30}
                               visibleRecordBatchSize={20}
                               criteriaField="locationName"
                               reportFields={[
                                   {
                                       label: "Check In",
                                       name: "checkInDate",
                                       formatter: (value) => {
                                           return moment(new Date(value)).format('MM/DD/YYYY hh:mm A');
                                       }
                                   },
                                   {
                                       label: "Container",
                                       name: "containerNumber"
                                   },
                                   {
                                       label: "Trailer",
                                       name: "trailerNumber"
                                   },
                                   {
                                       label: "Chassis",
                                       name: "chassisNumber"
                                   },
                                   {
                                       label: "CHASSIS LICENSE PLATE",
                                       name: "chassisLicensePlateNumber"
                                   },
                                   {
                                       label: "Size",
                                       name: "assetSize",
                                       formatter: value => `${value}ft`
                                   },
                                   {
                                       label: "Seal",
                                       name: "sealNumber"
                                   },
                                   {
                                       label: "Type",
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
                                                                                       "Refrigerated (Loaded) (Plug In"
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
                                       label: "Booking",
                                       name: "orderNumber"
                                   },
                                   {
                                       label: "Location",
                                       name: "locationName"
                                   },
                                   {
                                       label: "Supplier",
                                       name: "supplierName"
                                   }
                               ]}
                               account={this.state.account}
                />

            </div>
        );
    }
}

export default BuyerInventoryReport;
