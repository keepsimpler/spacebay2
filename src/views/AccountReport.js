import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import DataList from "./DataList";
import DateArrow from "../components/DateArrow";
import Select from "../components/Select";
import moment from "moment";
import { requestCreatePayouts, requestReadyForPayoutTransactionsForAccount } from './requests/account-report';
import { getErrorMessageForStandardResponse } from "../util/NetworkErrorUtil";
import Error from "../components/Error";

const $ = window.$;

class AccountReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            criteriaFieldOptions: [],
            selectedCriteriaFieldValue: this.props.criteriaField ? "All" : '',
            startDate: AccountReport.addDaysToToday(-this.props.defaultDaysInDateRange),
            endDate: AccountReport.addDaysToToday(this.props.defaultEndDateIsToday ? 0 : this.props.defaultDaysInDateRange),
            reportList: [],
            filteredReportList: [],
            locationModal: false,
            createPayoutSuccess: false,
            errorMsg: ''
        };

        this.labels = {};
        this.props.reportFields.forEach(field => {
            if (field.label) {
                this.labels[field.name] = field.label;
            }
        });
    }

    static addDaysToToday(numberOfDaysToAdd) {
        return AccountReport.addDaysToDate(new Date(), numberOfDaysToAdd);
    }

    static addDaysToDate(date, numberOfDaysToAdd) {
        date.setDate(date.getDate() + numberOfDaysToAdd);
        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();
        return mm + '/' + dd + '/' + yyyy;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account || nextProps.data !== this.props.data) {
            this.initDatePickers();
            this.loadReportData(nextProps.account, nextProps.data);
        } else if (!this.props.reloadData && nextProps.reloadData) {
            this.loadReportData(nextProps.account, nextProps.data);
        }
    }

    componentDidMount() {
        if (this.props.getReportDataUrl) {
            this.initDatePickers();
            this.loadReportData(this.props.account, this.props.data);
        }
    }

    initDatePickers() {
        $('#startDate').datepicker({format: 'm/d/yyyy', orientation: "bottom"}).on('changeDate', this.handleChange);
        $('#endDate').datepicker({format: 'm/d/yyyy', orientation: "bottom"}).on('changeDate', this.handleChange);
        $('#datesFieldset').datepicker({
            inputs: $('#startDate, #endDate')
        });
    }

    checkDateValues = event => {
        let account = this.props.account;
        let name = event.target.name;
        let value = event.target.value;
        event.stopImmediatePropagation();
        event.preventDefault();
        this.setState({[name]: value}, () => {
            let diff = Math.floor((Date.parse(this.state.endDate) - Date.parse(this.state.startDate)) / 86400000);
            if (this.props.maxDateRangeInDays && diff > this.props.maxDateRangeInDays) {
                let adjustInterval = diff - this.props.maxDateRangeInDays;
                if (name === 'startDate') {
                    let endDate = new Date(this.state.endDate);
                    this.setState({endDate: AccountReport.addDaysToDate(endDate, -adjustInterval)});
                } else if (name === 'endDate') {
                    let startDate = new Date(this.state.startDate);
                    this.setState({startDate: AccountReport.addDaysToDate(startDate, adjustInterval)});
                }
            }

            //remain in days interval


            if (account && account.id) {
                Busy.set(true);
                $.ajax({
                    url: this.props.getReportDataUrl(account, this.state.startDate, this.state.endDate),
                    type: 'GET',
                    contentType: 'application/json; charset=UTF-8',
                    success: this.handleSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(this.props.handleLogout)
                    },
                    error: this.handleFailure
                });
            }
        });
    };

    handleChange = event => {
        let name = event.target.name;
        if ((name === 'startDate' || name === 'endDate') && this.props.reloadOnDateChange === true) {
            this.checkDateValues(event);
        } else {
            this.setState({[name]: event.target.value}, () => this.filterByDatesAndCriteria());
        }
    };

    payOutGroupOfItems = () => {
        let transactionIds = this.state.filteredReportList.map(item => item.transaction.bookingTransactionId);
        this.setState({errorMsg: ''})
        this.payOut(transactionIds, true);
    };

    payOut = (transactionIds, isGrouped) => {
        Busy.set(true);

        requestCreatePayouts({
            supplierAccountId: this.props.account.id,
            transactionIds: transactionIds,
            groupForSupplier: isGrouped
        })
          .then(() => {
              this.setState({ createPayoutSuccess: true, locationModal: false });
              this.loadData(this.props.account)
              Busy.set(false);
          })
          .catch((err) => {
              Busy.set(false);
              this.setState({
                  errorMsg: getErrorMessageForStandardResponse(err, "An error occurred when creating payout")
              });
          })

    };

    loadData = account => {
        if (account && account.id) {
            Busy.set(true);
            requestReadyForPayoutTransactionsForAccount(account.id)
              .then((resp) => this.handleSuccess(resp.body))
              .catch((err) => this.handleFailure())
        }
    };

    loadReportData = (account, data) => {
        if (data) {
            this.setState({
                criteriaFieldOptions: this.props.criteriaField ? ["All", ...[...new Set(data.map((item) => {
                    let criteriaFieldParts = this.props.criteriaField.split('.');
                    return criteriaFieldParts.length === 1 ? item[criteriaFieldParts[0]] : item[criteriaFieldParts[0]][criteriaFieldParts[1]];
                }))].sort()] : [],
                reportList: data
            }, () => this.filterByDatesAndCriteria());
        } else if (this.props.getReportDataUrl) {
            if (account && account.id) {
                Busy.set(true);
                $.ajax({
                    url: this.props.getReportDataUrl(account, this.state.startDate, this.state.endDate),
                    type: 'GET',
                    contentType: 'application/json; charset=UTF-8',
                    success: this.handleSuccess,
                    statusCode: {
                        401: createLogoutOnFailureHandler(this.props.handleLogout)
                    },
                    error: this.handleFailure
                });
            }
        }
    };

    filterByDatesAndCriteria = () => {
        setTimeout(this.doFilterByDatesAndCriteria);
    };

    doFilterByDatesAndCriteria = () => {
        let filteredList;
        if (this.state.reportList && this.state.reportList.length && this.state.reportList.length > 0) {
            if (this.props.dateField || this.props.criteriaField) {

                let criteriaField = this.props.criteriaField;
                let dateField = this.props.dateField;
                let selectedCriteriaFieldValue = this.state.selectedCriteriaFieldValue;
                let startDate = new Date(this.state.startDate);
                let endDate = moment(new Date(this.state.endDate)).endOf("day").toDate();

                filteredList = this.state.reportList.filter(reportListItem => {
                    let criteriaMatches = false;
                    if (criteriaField) {

                        let criteriaFieldParts = this.props.criteriaField.split('.');
                        let reportListItemCriteriaFieldValue = criteriaFieldParts.length === 1 ? reportListItem[criteriaFieldParts[0]] : reportListItem[criteriaFieldParts[0]][criteriaFieldParts[1]];
                        criteriaMatches = selectedCriteriaFieldValue && ("All" === selectedCriteriaFieldValue || reportListItemCriteriaFieldValue === selectedCriteriaFieldValue);
                    } else {
                        criteriaMatches = true;
                    }
                    let dateMatches = false;
                    if (dateField) {
                        let fieldValue = reportListItem[dateField];
                        if (fieldValue) {
                            let dateFieldValue = new Date(fieldValue);
                            dateMatches = (dateFieldValue >= startDate && dateFieldValue <= endDate)
                        } else {
                            dateMatches = true;
                        }
                    } else {
                        dateMatches = true;
                    }
                    return criteriaMatches && dateMatches;
                });
            } else {
                filteredList = this.state.reportList;
            }
        } else {
            filteredList = [];
        }
        this.setState({filteredReportList: filteredList});
        Busy.set(false);
    };


    closeSelectLocationModal = () => {
        this.setState({locationModal: false});
    };

    openSelectLocationModal = () => {
        this.setState({selectedCriteriaFieldValue: "All", locationModal: true});
    };

    handleSuccess = data => {
        this.setState({
            criteriaFieldOptions: this.props.criteriaField ? ["All", ...[...new Set(data.map((item) => {
                let criteriaFieldParts = this.props.criteriaField.split('.');
                return criteriaFieldParts.length === 1 ? item[criteriaFieldParts[0]] : item[criteriaFieldParts[0]][criteriaFieldParts[1]];
            }))].sort()] : [],
            reportList: data
        }, () => {
            this.filterByDatesAndCriteria();
        });
        if (this.props.dataReloaded) {
            this.props.dataReloaded();
        }
    };

    handleFailure = data => {
        if (this.props.dataReloaded) {
            this.props.dataReloaded();
        }
        Busy.set(false);
    };

    render() {
        return (
            <div className="grey-bg hs-bookings-container h-100">
                <div>
                    <header>
                        <ul className="breadcrumb">
                            <li>{this.props.parentMenu ? this.props.parentMenu : "Reports"}</li>
                            <li>{this.props.title}</li>
                        </ul>
                        <div className="flex">
                            <h1 className="content-header-title">{this.props.title}</h1>
                            {
                                this.props.payOutGroupFunction ?
                                    <div className="payout-class">

                                        <button type="button"
                                                onClick={this.openSelectLocationModal}
                                                className="ss-button-secondary account-font-size"
                                        >
                                            Initiate Available Payouts
                                        </button>
                                    </div> : ""
                            }
                        </div>
                    </header>

                    {
                        this.props.criteriaField || this.props.dateField ?
                            <form className="ss-form ss-block">
                                <fieldset id="datesFieldset" className="dates-fieldset">
                                    {
                                        this.props.criteriaField ?
                                            <fieldset className="ss-fieldset-row-inner-left"
                                                      style={{marginLeft: "10px"}}>
                                                <label>{this.labels[this.props.criteriaField] ? this.labels[this.props.criteriaField].toUpperCase() : ''}</label>
                                                <Select id="selectedCriteriaFieldValue"
                                                        name="selectedCriteriaFieldValue"
                                                        style={{width: "400px"}}
                                                        handleChange={this.handleChange}
                                                        selectedOption={this.state.selectedCriteriaFieldValue}
                                                        placeholder="Choose"
                                                        options={this.state.criteriaFieldOptions}
                                                />
                                            </fieldset>
                                            :
                                            ''
                                    }
                                    {
                                        this.props.dateField ?
                                            <div className="date-field-container">
                                                <fieldset className="ss-fieldset-row-inner-left">
                                                    <label>START DATE</label>
                                                    <input type="text"
                                                           className="start-date ss-inline-start-date"
                                                           data-date-autoclose="true"
                                                           id="startDate"
                                                           name="startDate"
                                                           value={this.state.startDate}
                                                           title="Enter the report start date"
                                                           placeholder="MM/DD/YYYY"
                                                           onChange={this.checkEndDate} // TODO makes errors go away
                                                    />
                                                </fieldset>
                                                {
                                                    this.props.showEndDate ? <DateArrow className="date-field-arrow"/> : ''
                                                }
                                                {
                                                    this.props.showEndDate ?
                                                        <fieldset className="ss-fieldset-row-inner-right">
                                                            <label className="ss-inline-end-date-label">END DATE</label>
                                                            <input type="text"
                                                                   className="end-date ss-inline-end-date"
                                                                   data-date-autoclose="true"
                                                                   id="endDate"
                                                                   name="endDate"
                                                                   value={this.state.endDate}
                                                                   title="Enter the report end date"
                                                                   placeholder="MM/DD/YYYY"
                                                                   onChange={this.checkEndDate} // TODO makes errors go away
                                                            />
                                                        </fieldset> : ''
                                                }
                                        </div>
                                            :
                                            ''
                                    }
                                </fieldset>
                            </form>
                            : ''
                    }
                    <DataList dataType={this.props.title}
                              columnWidth={this.props.columnWidth}
                              reportFields={this.props.reportFields}
                              data={this.state.filteredReportList}
                              defaultGroupBy={this.props.defaultGroupBy}
                              defaultGroupSortDirction={this.props.defaultGroupSortDirction}
                              defaultSortBy={this.props.defaultSortBy}
                              defaultSortByDirection={this.props.defaultSortByDirection}
                              visibleRecordBatchSize={this.props.visibleRecordBatchSize}
                              actions={this.props.actionList}
                              hideGroupBy={this.props.hideGroupBy}
                              groupSummaryFields={this.props.groupSummaryFields}
                              initialSearchText={this.props.initialSearchText}
                              accumulateLocations={this.props.accumulateLocations}
                              shouldShowAccumulateButton={this.props.shouldShowAccumulateButton}
                              defaultAccumulate={this.props.defaultAccumulate}
                              handleAccumulateLocations={this.props.handleAccumulateLocations}
                    />

                    {
                        this.state.locationModal ?
                            <div className="unselectable">
                                <div className="modal-dialog background-white">

                                    <div className="popup-header">
                                        <h1>Initiate Payout by location</h1>
                                        <button onClick={this.closeSelectLocationModal} type="button"
                                                className="close pull-right" aria-label="Close"><img
                                            alt="" src="app-images/close.png"/></button>
                                    </div>
                                    <Select id="selectedCriteriaFieldValue"
                                            name="selectedCriteriaFieldValue"
                                            className="intiate-payout"
                                            handleChange={this.handleChange}
                                            selectedOption={this.state.selectedCriteriaFieldValue}
                                            placeholder="Choose"
                                            options={this.state.criteriaFieldOptions}
                                    />
                                    <div className="modal-footer">
                                        <div className="table text-center">
                                            {
                                                this.state.errorMsg &&
                                                  <Error>
                                                      {this.state.errorMsg}
                                                  </Error>
                                            }
                                            <button type="button"
                                                    onClick={this.payOutGroupOfItems}
                                                    className="ss-button-primary">Payout
                                            </button>
                                        </div>
                                    </div>

                                </div>

                            </div> : ""
                    }
                    {
                        this.state.createPayoutSuccess ?
                            <div className="unselectable">
                                <div className="modal-dialog background-white">
                                    <div className="modal-body">
                                        <h4 className="ss-summary">PAYOUT CREATED SUCCESSFULLY</h4>
                                    </div>
                                    <div className="modal-footer">
                                        <div className="table text-center">
                                            <button
                                                type="button"
                                                onClick={() => this.setState({
                                                    createPayoutSuccess: '',
                                                })}
                                                className="ss-button-primary">Done
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div> : ""
                    }

                </div>
            </div>
        )
    }
}

AccountReport.defaultProps = {
    showEndDate: true
}

export default AccountReport;
