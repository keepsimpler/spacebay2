import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import ReportRowAction from "../components/ReportRowAction";
import classNames from 'classnames'

class DataListResultsEntryRow extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.item !== nextProps.item || this.props.accumulateLocations !== nextProps.accumulateLocations;
    }

    static getDisplayValueFromField(item, field) {
        let rawValue = item[field.name] ? item[field.name] : '';
        let tempValue = DataListResultsEntryRow.getDisplayValue(rawValue, field.formatter, item);
        return tempValue || tempValue === 0 ? tempValue : '-';
    }

    static getDisplayValue(rawValue, formatter, listItem) {
        return formatter ? formatter(rawValue, listItem) : rawValue;
    }

    highlightRow(data) {
        if (this.props.accumulateLocations === true) {
            return !Object.values(data).includes("All Locations Combined");
        } else {
            return true;
        }
    }

    render() {
        return (
            <div>
                {
                    this.highlightRow(this.props.item) ?
                    <div className='report-row'>

                        <div className='report-row-data'>
                            {
                                this.props.reportFields.map((field, index) => {
                                    const {
                                        reportValueStyle,
                                        shouldApplyReportValueStyle = () => !!reportValueStyle
                                    } = field


                                    return (
                                        <div key={index.toString()}>
                                            {!field.hasOwnProperty("shouldShowField") || field.shouldShowField(this.props.item, field) ?

                                                <div>
                                                    <div
                                                        className={(field.label ? field.label.toLowerCase() : '') + ' report-label '}
                                                        style={{width: this.props.columnWidth ? this.props.columnWidth : "300px"}}>
                                                        {
                                                            field.label ?
                                                                <label>{field.label}:</label>
                                                                :
                                                                ''
                                                        }
                                                        {
                                                            field.action ?
                                                                <div
                                                                    className={classNames('report-value', shouldApplyReportValueStyle(this.props.item) && reportValueStyle)}
                                                                    title={DataListResultsEntryRow.getDisplayValueFromField(this.props.item, field)}>
                                                                    <a href=""
                                                                       onClick={() => field.action(this.props.item)}>{DataListResultsEntryRow.getDisplayValueFromField(this.props.item, field)}</a>
                                                                </div>
                                                                :
                                                                field.link ?
                                                                    <div
                                                                        className={classNames('report-value', shouldApplyReportValueStyle(this.props.item) && reportValueStyle)}
                                                                        title={DataListResultsEntryRow.getDisplayValueFromField(this.props.item, field)}>
                                                                        {field.link(this.props.item)}
                                                                    </div>
                                                                    :
                                                                    <div
                                                                        className={classNames('report-value', shouldApplyReportValueStyle(this.props.item) && reportValueStyle)}
                                                                        title={DataListResultsEntryRow.getDisplayValueFromField(this.props.item, field)}
                                                                        dangerouslySetInnerHTML={{__html: DataListResultsEntryRow.getDisplayValueFromField(this.props.item, field)}}/>
                                                        }
                                                    </div>
                                                </div>
                                                : ""
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                        {
                            this.props.actions ?
                                <div className='report-row-action'>
                                    <ReportRowAction actions={this.props.actions} item={this.props.item}/>
                                </div>
                                : ''
                        }
                    </div>
                : ''
                }
            </div>
        )
    }
}

export default DataListResultsEntryRow;
