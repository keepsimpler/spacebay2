import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import {CSVLink} from "react-csv";
import moment from "moment/moment";
import DataListResultsEntryRow from "./DataListResultsEntryRow";
import {formatCurrencyValue} from "../util/PaymentUtils";

class DataListResultsEntry extends Component {
    constructor(props) {
        super(props);

        this.visibleRecordBatchSize = this.props.visibleRecordBatchSize ? this.props.visibleRecordBatchSize : 20;

        this.state = {
            recordsShowing: this.props.entry[1].length >= this.visibleRecordBatchSize ? this.props.entry[1].slice(0, this.visibleRecordBatchSize) : this.props.entry[1],
            hasMore: true
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.entry !== nextProps.entry || this.props.groupBy !== nextProps.groupBy) {
            this.refreshVisibleRecords(nextProps.entry);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.entry !== nextProps.entry ||
            this.props.groupBy !== nextProps.groupBy ||
            this.state.recordsShowing !== nextState.recordsShowing
    }

    static getDisplayValue(rawValue, formatter) {
        return formatter ? formatter(rawValue) : rawValue;
    }

    createExportFileName = groupByValue => {
        let groupByPart = this.props.groupBy.name ? groupByValue + "_" : "";
        let datePart = moment(new Date()).format('MM-DD-YYYY_HH_mm');
        return `${groupByPart}${this.props.dataType}_${datePart}.csv`;
    };

    fetchMoreData = () => {
        if (this.state.recordsShowing.length >= this.props.entry[1].length) {
            this.setState({ hasMore: false });
            return;
        }

        let end = this.state.recordsShowing.length + this.visibleRecordBatchSize;
        this.setState({
            recordsShowing: this.props.entry[1].length >= end ? this.props.entry[1].slice(0, end) : this.props.entry[1]
        });
    };

    refreshVisibleRecords = entry => {
        this.setState({
            recordsShowing: entry[1].length >= this.visibleRecordBatchSize ? entry[1].slice(0, this.visibleRecordBatchSize) : entry[1]
        });
    };

    sum(items, prop){
        return items.reduce((a, b) => {
            return a + b[prop];
        }, 0);
    }

    buildReportsTitle() {
        if (this.props.accumulateLocations) {
            return this.props.entry[1].length - 1 + " records";
        }
        if (this.props.groupBy && this.props.groupBy.name) {
            return "No " + this.props.fieldLabels[this.props.groupBy.name] + " Value";
        } else {
            return this.props.entry[1].length + " records";
        }
    }

    editData(data) {
        return data.filter(dataItem => dataItem.location !== "All Locations Combined");
    }

    handleExcelData = () => {
        if (this.props.accumulateLocations) {
            return this.editData(this.props.entry[1]).map(listItem => listItem.exportData);
        } else {
            return this.props.entry[1].map(listItem => listItem.exportData);
        }
    }

    render() {
        let formatGroupSummaryFieldValue = (entry) => {
            if (entry.formatter) {
                return entry.formatter(this.props.entry[1]);
            } else if (entry.type === 'NUMBER') {
                return this.sum(this.props.entry[1], entry.name);
            } else {
                return formatCurrencyValue(this.sum(this.props.entry[1], entry.name), true);
            }
        };
        return (
            <div>
                {
                    this.props.entry[0] && this.props.entry[0] !== 'false' && this.props.entry[0] !== 'undefined' ?
                        <div  className="reports_title">
                            <h3>{this.props.entry[0]}
                                {
                                    this.state.recordsShowing.length !== this.props.entry[1].length ?
                                        <span className="ss-record-count"> (showing {this.state.recordsShowing.length} of {this.props.entry[1].length} records)</span>
                                        :
                                        <span className="ss-record-count"> (showing all {this.props.entry[1].length} records in group)</span>
                                }
                            </h3>
                            {
                                this.props.groupSummaryFields ?
                                    <div style={{marginTop: "20px", width: "300px"}}>
                                        {
                                            this.props.groupSummaryFields.map((entry, index) =>
                                                <div key={entry.id+'-datalistresultsentry-'+index}>
                                                    <div style={{
                                                        display: "inline-block",
                                                        fontSize: "13px",
                                                        fontWeight: "400",
                                                        color: "#999999"
                                                    }}>Total {entry.label}:&nbsp;&nbsp;</div>
                                                    <div style={{
                                                        display: "inline-block",
                                                        fontSize: "15px",
                                                        padding: "3px",
                                                        fontWeight: "700"
                                                    }}>{formatGroupSummaryFieldValue(entry)}</div>
                                                </div>
                                            )
                                        }
                                    </div>

                                    :
                                    ''
                            }
                        </div>
                        :
                        <div className="reports_title">
                            <h3>{this.buildReportsTitle()}
                                {
                                    this.state.recordsShowing.length !== this.props.entry[1].length ?
                                        <span className="ss-record-count"> (showing {this.state.recordsShowing.length} of {this.props.entry[1].length} records)</span>
                                        :
                                        <span className="ss-record-count"> (showing all records in group)</span>
                                }
                            </h3>
                            {
                                this.props.groupSummaryFields ?
                                    <div style={{marginTop: "20px", width: "300px"}}>
                                        {
                                            this.props.groupSummaryFields.map((entry,index) =>
                                                <div key={entry.id+'-datalistresultsentry-'+index}>
                                                    <div style={{
                                                        display: "inline-block",
                                                        fontSize: "13px",
                                                        fontWeight: "400",
                                                        color: "#999999"
                                                    }}>Total {entry.label}:&nbsp;</div>
                                                    <div style={{
                                                        display: "inline-block",
                                                        fontSize: "15px",
                                                        padding: "3px",
                                                        fontWeight: "700"
                                                    }}>{formatGroupSummaryFieldValue(entry)}</div>
                                                </div>
                                            )
                                        }
                                    </div>
                                    :
                                    ''
                            }
                        </div>
                }
                <div className="to_excel_container">
                    <CSVLink filename={this.createExportFileName(this.props.entry[0])}
                             data={this.handleExcelData()}
                             separator={","}>
                        <button
                                type="button"
                                className="ss-button-primary ss-excel-icon">EXPORT TO EXCEL
                        </button>
                    </CSVLink>
                </div>
                <div className='report-container'>
                        {this.state.recordsShowing.map((item, index) =>
                            <DataListResultsEntryRow  key={item.id+'-dlrerow-'+index}
                                                      item={item}
                                                      reportFields={this.props.reportFields}
                                                      columnWidth={this.props.columnWidth}
                                                      actions={this.props.actions}
                                                      accumulateLocations={this.props.accumulateLocations}



                            />
                        )}
                    {
                        this.state.recordsShowing.length !== this.props.entry[1].length ?
                            <div className="ss-load-more-records">
                                <a className="ss-load-more-records-link" onClick={(event) => {this.fetchMoreData(); event.preventDefault();}}>
                                    Show next {(this.visibleRecordBatchSize <= (this.props.entry[1].length - this.state.recordsShowing.length)) ? this.visibleRecordBatchSize : this.props.entry[1].length - this.state.recordsShowing.length} records ({this.props.entry[1].length - this.state.recordsShowing.length} not shown)
                                </a>
                            </div>
                            :
                            <div className="ss-load-more-records">
                                Showing all records in group
                            </div>
                    }
                </div>
            </div>
        )
    }
}

export default DataListResultsEntry;
