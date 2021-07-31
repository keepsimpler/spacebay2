import React, {Component} from 'react';
import AccountReport from "./AccountReport";
import {formatCurrencyValue} from "../util/PaymentUtils";
import {abbrState} from "../util/StateUtil";

const $ = window.$;

export default class AdminLocationsReport extends Component {

    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            reloadData: false,
            showAdjustDate: false,
        };

    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.state.account) {
            this.setState({account: nextProps.account});
        }
    }

    dataReloaded = () => {
        this.setState({reloadData: false});
    };

    render() {
        let numberOrZero = function(value){
            return value ? value : 0;
        };
        let yesOrNo = function (value) {
            return value ? 'Yes' : 'No'
        };
        let lowercase = function (value) {
            return value.replace('_', ' ').toLowerCase();
        };
           return (
            <div className="h-100">
                <AccountReport title="Locations"
                               getReportDataUrl={(account) => `api/admins/locations`}
                               reloadData={this.state.reloadData}
                               dataReloaded={this.dataReloaded}
                               columnWidth={$(window).width() > 1000 ? "400px" : "300px"}
                               defaultSortBy="companyName"
                               defaultSortByDirection="ASC"
                               reportFields={[
                                   {
                                       label: "Company Name",
                                       name: "companyName"
                                   },
                                   {
                                       label: "Location Name",
                                       name: "locationName"
                                   },
                                   {
                                       label: "phone",
                                       name: "phoneNumber"
                                   },
                                   {
                                       label: "Total Spaces at Facility",
                                       name: "totalNumberOfSpaces"
                                   },
                                   {
                                       label: "# Of Bookings",
                                       name: "noBookings",
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "# Of Locations",
                                       name: "noLocations",
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "Secure Space %",
                                       name: "ssPercentage",
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "Instant Approval Location",
                                       name: "managedLocation",
                                       formatter: yesOrNo
                                   },
                                   {
                                       label: "Total Instant Approval Spaces",
                                       name: "managedSpaces",
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "Address",
                                       name: "addressLine1"
                                   },
                                   {
                                       label: "City",
                                       name: "city"
                                   },
                                   {
                                       label: "State",
                                       name: "state",
                                       formatter: abbrState
                                   },
                                   {
                                       label: "Zip",
                                       name: "zip"
                                   },
                                   {
                                       label: "Location Image?",
                                       name: "listingImageFileName",
                                       formatter: yesOrNo
                                   },
                                   {
                                       label: "# Gallery Images",
                                       name: "galleryImages",
                                       formatter: numberOrZero
                                   },
                                   {
                                       label: "Min # Of Spaces",
                                       name: "minNumberOfSpaces"
                                   },
                                   {
                                       label: "Min Duration",
                                       name: "minDuration"
                                   },
                                   {
                                       label: "Created On",
                                       name: "createdOn"
                                   },
                                   {
                                       label: "Account Activated",
                                       name: "accountActivated",
                                       formatter: yesOrNo
                                   },
                                   {
                                       label: "Has Reservation Agreement",
                                       name: "reservationAgreement",
                                       formatter: yesOrNo
                                   },
                                   {
                                       label: "Visible In Search",
                                       name: "isVisible",
                                       formatter: yesOrNo
                                   },
                                   {
                                       label: "SPS Subscription Type",
                                       name: "subscriptionType",
                                       formatter: lowercase
                                   },
                                   {
                                       label: "Price Per Day",
                                       name: "pricePerDay",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Price Per Week",
                                       name: "pricePerWeek",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Price Per Month",
                                       name: "pricePerMonth",
                                       formatter: formatCurrencyValue
                                   },
                                   {
                                       label: "Eq. Types",
                                       name: "locationEquipmentTypes",
                                       formatter:function(value, item){
                                           if(value.length>0){
                                               let response="";
                                               for(let i=0;i<value.length;i++){
                                                   let pricePerDay = value[i].pricePerDay ? value[i].pricePerDay : item.pricePerDay;
                                                   let pricePerMonth = value[i].pricePerMonth ? value[i].pricePerMonth : item.pricePerMonth;
                                                   response +=value[i].equipmentType;
                                                   if (pricePerDay) {
                                                       response +=": Daily = "+formatCurrencyValue(pricePerDay);
                                                   }
                                                   if (pricePerMonth) {
                                                       response +=", Monthly = "+formatCurrencyValue(pricePerMonth);
                                                   }
                                                   if (i < (value.length - 1)) {
                                                       response += "<br>";
                                                   }
                                               }
                                               return response;
                                           }else{
                                               return "";
                                           }

                                       }
                                   },
                                   {
                                       label: "Description",
                                       name: "locationDescription"
                                   },
                                   {
                                       label: "Features",
                                       name: "locationFeatures"
                                   },
                                   {
                                       label: "Facility Inst",
                                       name: "facilityInstructions"
                                   }
                               ]}
                               actionList={[]}
                               account={this.state.account}
                />

            </div>
        )
    }
}

