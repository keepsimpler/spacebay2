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

const $ = window.$;

class SubReport extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subReportList: [],
            subReportFilteredList: []
        };
    }

    componentDidMount() {
        $('html').scrollTop(0);
        this.loadData(this.props.account);
    }

    loadData = () => {
        if (this.props.data) {
            this.handleSuccess(this.props.data);
        } else {
            Busy.set(true);
            $.ajax({
                url: this.props.getListDataUrl(this.props.parentRecord),
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

    handleSuccess = subReportData => {
        if (subReportData) {
            this.setState({subReportList: subReportData, subReportFilteredList: subReportData});
        }
        Busy.set(false);
    };

    handleFailure = subReportData => {
        Busy.set(false);
    };

    render() {
        return (
            <div className="grey-bg hs-bookings-container">
                <img alt="" style={{top: "90px"}}
                     className="ss-close-large-screen"
                     src="../app-images/close.png"
                     onClick={() => this.props.handlePanelCloseEvent()}/>
                <h1 className="content-header-title">{this.props.title}</h1>

                {this.props.heading}

                <div style={{padding: "0 40px"}}>
                    <DataList dataType={this.props.title}
                              columnWidth={this.props.columnWidth}
                              labelWidth={this.props.labelWidth}
                              reportFields={this.props.subReportFields}
                              data={this.state.subReportList}
                    />
                </div>
            </div>
        )
    }
}

export default SubReport;
