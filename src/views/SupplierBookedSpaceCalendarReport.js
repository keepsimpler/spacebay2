import React, {Component} from 'react';
import AccountReport from "./AccountReport";
import {toast} from 'react-toastify';
import moment from "moment";

class SupplierBookedSpaceCalendarReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
        }
    }

    viewInvoice = item => {
        if (item && item.overageInvoiceNumbers) {
            let invoiceNumbers = item.overageInvoiceNumbers.split(",");
            for (let invoiceNumber of invoiceNumbers) {
                window.open(this.props.account.baseUrl + "/api/invoices-by-invoice-number/" + invoiceNumber);
            }
        } else {
            toast.error("No invoice numbers for day.");
        }
    };

    viewInventoryLog = item => {
        if (item && item.overageInvoiceNumbers) {
            let invoiceNumbers = item.overageInvoiceNumbers.split(",");
            for (let invoiceNumber of invoiceNumbers) {
                window.open(this.props.account.baseUrl + '/api/overage-daily-report-by-invoice-number/' + invoiceNumber);
            }
        } else {
            let baseUrl = this.props.account.baseUrl;
            let locationId = item.locationId;
            let buyerAccountId = item.buyerAccountId;
            let date = moment(item.calendarDate).format('YYYY-MM-DD');
            window.open(`${baseUrl}/api/overage-daily-report-by-date/${locationId}/${buyerAccountId}/${date}`);
        }
    };

    sum = (items, prop) => {
        return items.reduce((a, b) => {
            return prop ? a + b[prop] : a + b;
        }, 0);
    };

    calculateOveragesSpaces = (listItem) => {
        let maxInventoryCount = listItem.maxInventoryCount;
        let bookedSpaces = listItem.totalSpacesBooked;
        return maxInventoryCount > bookedSpaces ? maxInventoryCount - bookedSpaces : 0;
    };

    render() {
        let numberOrZero = function(value){
            return value ? value : 0;
        };
        return (
            <div className="flex h-100">
                <AccountReport title="Booked Space Calendar"
                               parentMenu="Bookings"
                               reloadOnDateChange={true}
                               getReportDataUrl={(account, startDate, endDate) => `api/suppliers/${account.id}/space-utilization?startDate=${startDate}&endDate=${endDate}`}
                               defaultSortBy="calendarDate"
                               defaultDaysInDateRange={7}
                               maxDateRangeInDays={180}
                               defaultEndDateIsToday={true}
                               visibleRecordBatchSize={10}
                               criteriaField="locationName"
                               dateField="calendarDate"
                               reportFields={[
                                   {
                                       label: "DATE",
                                       name: "calendarDate",
                                       groupable: false
                                   },
                                   {
                                       label: "BOOKED SPACES",
                                       name: "totalSpacesBooked",
                                       groupable: false,
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "MAX INVENTORY",
                                       name: "maxInventoryCount",
                                       groupable: false,
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "OVERAGE SPACES",
                                       name: "overageSpacesChargedCount",
                                       groupable: false,
                                       formatter: (rawValue, listItem) => {
                                           return this.calculateOveragesSpaces(listItem);
                                       }
                                   },
                                   {
                                       label: "CHARGED OVERAGES",
                                       name: "overageSpacesChargedCount",
                                       groupable: false,
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "UN-CHARGED OVERAGES",
                                       name: "overageSpacesChargedCount",
                                       formatter: (rawValue, listItem) => {
                                           let overagesSpaces = this.calculateOveragesSpaces(listItem);
                                           let overagesCharged = listItem.overageSpacesChargedCount;
                                           return overagesSpaces - overagesCharged;
                                       },
                                       groupable: false
                                   },
                                   {
                                       label: "DURATION TYPE",
                                       name: "durationType"
                                   },
                                   {
                                       label: "CUSTOMER",
                                       name: "buyerCompanyName"
                                   },
                                   {
                                       label: "LOCATION",
                                       name: "locationName"
                                   },
                                   {
                                       label: "BOOKINGS",
                                       name: "bookingNumbers",
                                       formatter: (rawValue, listItem) => {
                                           return listItem.totalSpacesBooked > 0 ? listItem.bookingNumbers : '';
                                       },
                                       groupable: false
                                   },
                                   {
                                       label: "OVERAGE INVOICES",
                                       name: "overageInvoiceNumbers",
                                       groupable: false
                                   }
                               ]}
                               groupSummaryFields={[
                                   {
                                       label: "Overage Spaces",
                                       formatter: (allGroupItems) => {
                                           return this.sum(allGroupItems.map((listItem) => this.calculateOveragesSpaces(listItem)));
                                       }
                                   },
                                   {
                                       label: "Charged Overages",
                                       name: "overageSpacesChargedCount",
                                       type: 'NUMBER'
                                   },
                                   {
                                       label: "Un-Charged Overages",
                                       formatter: (allGroupItems) => {
                                           let totalOveragesDue = this.sum(allGroupItems.map((listItem) => this.calculateOveragesSpaces(listItem)));
                                           let totalOveragesCharged = this.sum(allGroupItems, "overageSpacesChargedCount");
                                           return totalOveragesDue - totalOveragesCharged;
                                       }
                                   }
                               ]}
                               account={this.state.account}
                               actionList={
                                   [
                                       {
                                           displayValue: 'View Overage Invoices',
                                           action: this.viewInvoice
                                       },
                                       {
                                           displayValue: 'View Inventory Log',
                                           action: this.viewInventoryLog,
                                       }

                                   ]
                               }
                />
            </div>
        )
    }
}

export default SupplierBookedSpaceCalendarReport;
