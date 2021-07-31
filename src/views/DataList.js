import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import '../css/views/dataList.css';
import _ from 'underscore';
import Select from "../components/Select";
import ButtonSelector from "../components/ButtonSelector";
import DataListResults from "./DataListResults";
import moment from "moment/moment";
import {formatCurrencyValue} from "../util/PaymentUtils";
import Busy from "../components/Busy";
import {CSVLink} from "react-csv";

const SORT_DIRECTION_ASC = "ASC";
const SORT_DIRECTION_DESC = "DESC";
const ACCUMULATED = "YES";
const NON_ACCUMULATED = "NO";

class DataList extends Component {
    constructor(props) {
        super(props);
        let noneGroupByOption = {
            name: "",
            getDisplayValue: () => "None"
        };

        let defaultGroupByOption = noneGroupByOption;
        let groupByOptions = this.props.reportFields
            .filter((field) => field.hasOwnProperty("groupable") ? field.groupable : true)
            .map(field => {
                let option = {
                    name: field.name,
                    getDisplayValue: () => field.label
                };
                if (this.props.defaultGroupBy === field.name) {
                    defaultGroupByOption = option;
                }
                return option;
            });
        groupByOptions.unshift(
            noneGroupByOption
        );

        let defaultSortByOption = '';
        let sortByOptions = this.props.reportFields.map(field => {
            let option = {
                name: field.name,
                getDisplayValue: () => field.label
            };
            if (this.props.defaultSortBy === field.name) {
                defaultSortByOption = option;
            }
            return option;
        });
        if (!defaultSortByOption) {
            defaultSortByOption = sortByOptions[0];
        }

        this.state = {
            searchBox: this.props.initialSearchText ? this.props.initialSearchText : '',
            listData: [],
            filteredList: [],
            groupBy: defaultGroupByOption,
            groupByOptions: groupByOptions,
            groupBySortDirection: this.props.defaultGroupSortDirction ? this.props.defaultGroupSortDirction : SORT_DIRECTION_ASC,
            sortBy: defaultSortByOption,
            sortByOptions: sortByOptions,
            sortBySortDirection: this.props.defaultSortByDirection ? this.props.defaultSortByDirection : SORT_DIRECTION_ASC,
            directionalSortedData: [],
            sortGroupData: [],
            pendingAccount: 0, //displaying all accounts
            defaultAccumulate: NON_ACCUMULATED,
        };

        this.searchKeys = this.props.reportFields
            .filter((field) => field.hasOwnProperty("searchable") ? field.searchable : true)
            .map((field) => field.name);

        this.formatters = {};
        this.props.reportFields.forEach(field => {
            if (field.formatter) {
                this.formatters[field.name] = field.formatter;
            }
        });
        this.fieldLabels = {};
        this.props.reportFields.forEach(field => {
            this.fieldLabels[field.name] = field.label;

        });

        this.searchHandle = '';
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.updateListData(nextProps.data);
        }
    }

    componentDidMount() {
        this.updateListData(this.props.data);
    }

    updateListData(data) {
        let _this = this;
        if (data) {
            let supplementedData = data.map(dataItem => {
                return {
                    ...dataItem,
                    searchText: this.searchKeys.map(key => DataList.getDisplayValue(dataItem[key], this.formatters[key], dataItem)).join("").toLocaleLowerCase(),
                    exportData: this.createExportData(dataItem)
                };
            });
            this.setState({listData: supplementedData, filteredList: supplementedData}, () => {
                let results = _this.state.searchBox ? _this.search(_this.state.searchBox) : _this.state.listData;
                _this.setState({
                    filteredList: results
                }, () => _this.reorganizeListData());
            });
        }
    }

    searchChangeHandler = event => {
        let name = event.target.name;
        let value = event.target.value;

        this.setState({
            [name]: value
        });

        let _this = this;
        clearTimeout(this.searchHandle);

        this.searchHandle = setTimeout(function () {
            let results = value ? _this.search(value) : _this.state.listData;
            _this.setState({
                filteredList: results
            }, () => _this.reorganizeListDataInTimeout());
        }, 1000);
    };

    groupByChangeHandler = event => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value}, () => this.reorganizeListDataInTimeout());
    };

    groupBySortDirectionChangeHandler = value => {
        this.setState({groupBySortDirection: value}, () => this.reorganizeListDataInTimeout());
    };

    sortByChangeHandler = event => {
        let name = event.target.name;
        let value = event.target.value;
        this.setState({[name]: value}, () => this.reorganizeListDataInTimeout());
    };

    sortBySortDirectionChangeHandler = value => {
        this.setState({sortBySortDirection: value}, () => this.reorganizeListDataInTimeout());
    };

    search(filterText) {
        let filterTokens = filterText.split(" ").map(value => value.toLocaleLowerCase());

        return this.state.listData.filter(reportListItem => {
            for (let token of filterTokens) {
                if (!reportListItem.searchText.includes(token)) {
                    return false;
                }
            }
            return true;
        });
    }

    createExportData(dataItem) {
        let exportData = {};
        this.props.reportFields.forEach((field) => {
            if (field.label) {
                if (field.formatter) {
                    exportData[field.label] = field.formatter(dataItem[field.name], dataItem)
                } else {
                    exportData[field.label] = dataItem[field.name]
                }
            }
        });
        return exportData;
    }


    static shouldShowField(item, field) {
        let rawValue = item[field.name];
        return rawValue || (!rawValue && !field.hideIfNoValue);
    }

    static getDisplayValue(rawValue, formatter, listItem) {
        return formatter ? formatter(rawValue, listItem) : rawValue;
    }

    reorganizeListDataInTimeout = () => {
        let _this = this;
        clearTimeout(_this.searchHandle);
        Busy.set(true);
        _this.searchHandle = setTimeout(function () {
            _this.reorganizeListData();
            Busy.set(false);
        }, 1000);
    };

    reorganizeListData = () => {
        /**
         * Creates an object map with keys of the groupby property value and values of all records matching the groupby property value.
         * ex:
         *
         *   {
         *       "Customer 1": [
         *           {
         *               "id" "123",
         *               "name": "abc",
         *               "createdOn": "1/1/1970"
         *           },
         *           ...
         *       ],
         *       "Customer 2": [
         *           {
         *               "id" "456",
         *               "name": "def",
         *               "createdOn": "2/2/1971"
         *           },
         *           ...
         *       ],
         *       ...
         *   }
         *
         **/

        const groupedData = _.groupBy(this.state.filteredList, (listItem) => {
            let groupByValue = listItem[this.state.groupBy.name];
            return groupByValue || groupByValue === false ? DataList.getDisplayValue(groupByValue, this.formatters[this.state.groupBy.name], listItem) : "";
        });

        /**
         * Creates a 2D arrary out of the properties in the above groupby object, then sorts the array by the property name.
         * ex.
         *
         * [
         *      [
         *          "Customer 1",
         *          [
         *              {
         *                  "id" "123",
         *                  "name": "abc",
         *                  "createdOn": "1/1/1970"
         *              },
         *              ...
         *          ]
         *      ],
         *      [
         *          "Customer 2",
         *          [
         *              {
         *                  "id" "456",
         *                  "name": "def",
         *                  "createdOn": "2/2/1971"
         *              },
         *              ...
         *          ]
         *      ],
         *      ...
         * ]
         *
         */

        let sortedData = _.sortBy(Object.entries(groupedData), (unsortedEntry) => unsortedEntry[0]);

        //Just flips the direction of the groups if the sort direction is descending
        let directionalSortedData = this.state.groupBySortDirection === SORT_DIRECTION_ASC ? sortedData : sortedData.reverse();

        //Sorts the records inside each group
        let groupDataSorted = directionalSortedData.map((sortedEntry) => [sortedEntry[0], this.sortGroupData(sortedEntry[1])]);

        this.setState({
            directionalSortedData: groupDataSorted,
            groupSummaryData: this.buildGroupSummaryData(groupDataSorted)
        });
    };

    buildGroupSummaryData(groups) {
        let groupSummaryData = [];
        if (this.props.groupSummaryFields) {
            let groupByDisplayValue = this.state.groupBy ? this.state.groupBy.getDisplayValue() : "All";
            groupByDisplayValue = groupByDisplayValue === "None" ? "Not Grouped" : groupByDisplayValue;
            groups.forEach(group => {
                let groupName = group[0] ? group[0] : "All";
                let groupRecords = group[1];

                let groupSummaryRecord = {};
                groupSummaryRecord[groupByDisplayValue] = groupName;
                this.props.groupSummaryFields.forEach(summaryField => {
                    let summaryFieldLabel = "Total " + summaryField.label;

                    groupSummaryRecord[summaryFieldLabel] = this.formatGroupSummaryFieldValue(summaryField, groupRecords);
                });
                groupSummaryData.push(groupSummaryRecord);
            });
        }
        return groupSummaryData;
    }

    formatGroupSummaryFieldValue = (groupSummaryField, groupRecords) => {
        if (groupSummaryField.formatter) {
            return groupSummaryField.formatter(groupRecords);
        } else if (groupSummaryField.type === 'NUMBER') {
            return this.sum(groupRecords, groupSummaryField.name);
        } else {
            return formatCurrencyValue(this.sum(groupRecords, groupSummaryField.name), true);
        }
    };

    sum(items, prop) {
        return items.reduce((a, b) => {
            return a + b[prop];
        }, 0);
    }

    sortGroupData = groupData => {
        let sortedGroupData = _.sortBy(groupData, (item) => {
            let value = item[this.state.sortBy.name];
            let possibleDateValue = moment(new Date(value));

            if (possibleDateValue.isValid()) {
                return possibleDateValue.toDate();
            } else {
                return value ? value.toString().trim() : "";
            }
        });
        return this.state.sortBySortDirection === SORT_DIRECTION_ASC ? sortedGroupData : sortedGroupData.reverse();
    };

    createExportFileName = () => {
        let groupByDisplayValue = this.state.groupBy ? this.state.groupBy.getDisplayValue() : "All";
        groupByDisplayValue = groupByDisplayValue === "None" ? "Not_Grouped" : groupByDisplayValue;
        return groupByDisplayValue + "_" + this.props.dataType + "_Summary.csv";
    };

    handleChange = (val) => {
        this.setState({value: val});
    }

    handleAccumulateLocationsChange = (value) => {
        this.props.handleAccumulateLocations(value);
        this.setState({defaultAccumulate: value}, () => this.reorganizeListDataInTimeout());
    }

    render() {
        return (
            <div>
                {
                    this.props.groupSummaryFields ?
                        <div style={{textAlign: "right", marginTop: "15px"}}>
                            <CSVLink filename={this.createExportFileName()}
                                     data={this.state.groupSummaryData ? this.state.groupSummaryData : []}
                                     separator={","}>
                                <button type="button" className="ss-button-primary ss-excel-icon">EXPORT GROUP
                                    SUMMARIES
                                </button>
                            </CSVLink>
                        </div>
                        :
                        ""
                }
                <div>
                    <form className="report-form">
                        <div className="data-list-filter-container search-container">
                            <fieldset className='trigger-click hs-field'>
                                <label>FILTER</label>
                                <input type="text"
                                       id="searchBox"
                                       name="searchBox"
                                       value={this.state.searchBox}
                                       onChange={this.searchChangeHandler}
                                       placeholder="Type to filter results"
                                />
                                <i className="fa fa-search"/>
                            </fieldset>
                        </div>
                        {
                            this.props.hideGroupBy ?
                                ''
                                :
                                <div className="ss-stand-alone data-list-filter-container search-container">
                                    <fieldset className="ss-fieldset-row-inner-left">
                                        <label>GROUP BY</label>
                                        <Select id="groupBy"
                                                name="groupBy"
                                                handleChange={this.groupByChangeHandler}
                                                selectedOption={this.state.groupBy}
                                                placeholder="Choose"
                                                options={this.state.groupByOptions}
                                        />
                                    </fieldset>
                                    <div className="ss-fieldset-row-inner-middle">
                                        <ButtonSelector options={[SORT_DIRECTION_ASC, SORT_DIRECTION_DESC]}
                                                        selectedOption={this.state.groupBySortDirection}
                                                        handleOptionSelected={this.groupBySortDirectionChangeHandler}
                                        />
                                    </div>
                                </div>
                        }
                        <div className="ss-stand-alone data-list-filter-container search-container">
                            <fieldset className="ss-fieldset-row-inner-left">
                                <label>SORT BY</label>
                                <Select id="sortBy"
                                        name="sortBy"
                                        handleChange={this.sortByChangeHandler}
                                        selectedOption={this.state.sortBy}
                                        placeholder="Choose"
                                        options={this.state.sortByOptions}
                                />
                            </fieldset>
                            <div className="ss-fieldset-row-inner-middle">
                                <ButtonSelector options={[SORT_DIRECTION_ASC, SORT_DIRECTION_DESC]}
                                                selectedOption={this.state.sortBySortDirection}
                                                handleOptionSelected={this.sortBySortDirectionChangeHandler}
                                />
                            </div>
                        </div>
                        {
                            this.props.shouldShowAccumulateButton &&
                                <div className="ss-stand-alone data-list-filter-container search-container">
                                    <fieldset className="ss-fieldset-row-inner-left">
                                        <label>SHOW SUMMARY</label>
                                    </fieldset>
                                    <div className="ss-fieldset-row-inner-middle">
                                        <ButtonSelector options={[ACCUMULATED, NON_ACCUMULATED]}
                                                        selectedOption={this.state.defaultAccumulate}
                                                        handleOptionSelected={this.handleAccumulateLocationsChange}
                                        >
                                        </ButtonSelector>
                                    </div>
                                </div>
                        }
                    </form>
                </div>
                <DataListResults
                    dataType={this.props.dataType}
                    formatters={this.formatters}
                    reportFields={this.props.reportFields}
                    columnWidth={this.props.columnWidth}
                    actions={this.props.actions}
                    directionalSortedData={this.state.directionalSortedData}
                    groupBy={this.state.groupBy}
                    sortGroupData={this.sortGroupData}
                    listData={this.state.listData}
                    visibleRecordBatchSize={this.props.visibleRecordBatchSize}
                    groupSummaryFields={this.props.groupSummaryFields}
                    fieldLabels={this.fieldLabels}
                    accumulateLocations={this.props.accumulateLocations}
                    handleAccumulateLocations={this.props.handleAccumulateLocations}
                />
            </div>
        )
    }
}

export default DataList;
