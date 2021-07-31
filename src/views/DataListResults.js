import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import DataListResultsEntry from "./DataListResultsEntry";

class
DataListResults extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.directionalSortedData !== nextProps.directionalSortedData ||
            this.props.groupBy !== nextProps.groupBy ||
            this.props.sortGroupData !== nextProps.sortGroupData ||
            this.props.listData !== nextProps.listData;
    }

    render() {
        return (
            <div className="list-container">
                {this.props.directionalSortedData && this.props.directionalSortedData.length > 0 ?
                    <div >
                        {this.props.directionalSortedData.map((entry, index) =>
                            <DataListResultsEntry  key={entry[1][0].id+'-'+index}
                                                   entry={entry}
                                                   dataType={this.props.dataType}
                                                   formatters={this.props.formatters}
                                                   reportFields={this.props.reportFields}
                                                   columnWidth={this.props.columnWidth}
                                                   actions={this.props.actions}
                                                   groupBy={this.props.groupBy}
                                                   sortGroupData={this.props.sortGroupData}
                                                   visibleRecordBatchSize={this.props.visibleRecordBatchSize}
                                                   groupSummaryFields={this.props.groupSummaryFields}
                                                   fieldLabels={this.props.fieldLabels}
                                                   accumulateLocations={this.props.accumulateLocations}

                            />
                        )}
                    </div>
                    :
                    this.props.listData && this.props.listData.length > 0 ?
                        <div className="recordMessage">All records are currently filtered</div>
                        :
                        <div className="recordMessage">No matching&nbsp;<strong>{this.props.dataType}</strong>&nbsp;records found.</div>
                }
            </div>
        )
    }
}

export default DataListResults;
