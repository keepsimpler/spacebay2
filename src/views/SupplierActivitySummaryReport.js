import React from "react";
import AccountReport from "./AccountReport";

const SupplierActivitySummaryReport = (props) => {

    const [accumulateLocations, setAccumulateLocations] = React.useState(true);

    const numberOrZero = (value) => {
        return value ? value : 0;
    };

    const handleAccumulateLocations = (value) => {
        if (value === "YES") {
            setAccumulateLocations(false);
        } else {
            setAccumulateLocations(true);
        }
    }

    return (
        <div className="flex h-100">
            <AccountReport title="Activity Summary Report"
                           parentMenu="Gate Management"
                           reloadOnDateChange={true}
                           getReportDataUrl={(account, date) => `api/reporting/supplier-activity-summary?startDate=${date}&accountId=${account.id}`}
                           defaultSortBy="location"
                           defaultAccumulate="YES"
                           defaultDaysInDateRange={0}
                           maxDateRangeInDays={180}
                           defaultEndDateIsToday={true}
                           visibleRecordBatchSize={10}
                           hideGroupBy={true}
                           dateField="calendarDate"
                           showEndDate={false}
                           shouldShowAccumulateButton={true}
                           account={props.account}
                           accumulateLocations={accumulateLocations}
                           handleAccumulateLocations={handleAccumulateLocations}
                           reportFields={[
                               {
                                   label: "LOCATION",
                                   name: "location",
                               },
                               {
                                   label: "CURRENT INVENTORY",
                                   name: "currentInventory",
                               },
                               {
                                   label: "MAX INVENTORY",
                                   name: "maxInventoryCount",
                               },
                               {
                                   label: "CAPACITY",
                                   name: "capacity",
                               },
                               {
                                   label: "MAX CAPACITY",
                                   name: "maxCapacity",
                               },
                               {
                                   label: "BOOKED SPACES",
                                   name: "bookedSpaces",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "TOTAL MONTHLY CUSTOMERS",
                                   name: "totalMonthlyCustomers",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "TOTAL DAILY CUSTOMERS",
                                   name: "totalDailyCustomers",
                                   type: 'NUMBER',
                                   formatter: numberOrZero
                               },
                               {
                                   label: "OVERAGE SPACES",
                                   name: "overageSpaces",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "CHASSIS ONLY",
                                   name: "chassisOnly",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "CONTAINER EMPTY",
                                   name: "containerEmpty",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "CONTAINER LOADED",
                                   name: "containerLoaded",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "REEFERS",
                                   name: "reefers",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "IN GATES PAST 24 HOURS",
                                   name: "inGatesPast24Hours",
                                   formatter: numberOrZero
                               },
                               {
                                   label: "OUT GATES PAST 24 HOURS",
                                   name: "outGatesPast24Hours",
                                   formatter: numberOrZero
                               }
                           ]}
            />
        </div>
    )
}

export default SupplierActivitySummaryReport;
