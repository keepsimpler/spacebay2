import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/views/adminReports.css';
import DateArrow from "../components/DateArrow";

const $ = window.$;

class AdminReports extends Component {
    constructor (props) {
        super(props);
        this.state = {
            accountId: '',
            startDate: '',
            endDate: ''
        };
    }

    componentDidMount() {
        this.initDatePickers();
    }

    initDatePickers() {
        $('#startDate').datepicker({format: 'm/d/yyyy'}).on('changeDate', this.handleChange);
        $('#endDate').datepicker({format: 'm/d/yyyy'}).on('changeDate', this.handleChange);
        $('#datesFieldset').datepicker({
            inputs: $('#startDate, #endDate')
        });
    }

    handleChange = event => {
        let name = event.target.name;
        if ('startDate' === name) {
            $('#endDate').focus();
        }
        this.setState({[name]: event.target.value});
    };

    render () {
        return (
            <div id="ssAdminReports" className="ss-main ss-horizontal h-100">
                <header>
                    <h1 className="page-title">Admin Reports</h1>
                    <h3>Click the following links to retrieve a realtime report of the data.</h3>
                </header>
                <section>
                    <div id="ssReportCriteriaPanel">
                        <form className="ss-form ss-block">
                            <fieldset id="accountIdFieldset" className="ss-top">
                                <label htmlFor="accountId">ACCOUNT ID</label>
                                <input type="text"
                                       id="accountId"
                                       name="accountId"
                                       value={this.state.accountId}
                                       onChange={this.handleChange}
                                       placeholder="Enter the report account ID"
                                />
                            </fieldset>
                            <fieldset id="datesFieldset" className="ss-bottom">
                                <fieldset className="ss-fieldset-row-inner-left">
                                    <label>Start Date</label>
                                    <input type="text"
                                           className="start-date ss-inline-start-date"
                                           data-date-autoclose="true"
                                           id="startDate"
                                           name="startDate"
                                           value={this.state.startDate}
                                           title="Enter the report start date"
                                           placeholder="MM/DD/YYYY"
                                    />
                                </fieldset>
                                <DateArrow/>
                                <fieldset className="ss-fieldset-row-inner-right">
                                    <label className="ss-inline-end-date-label">End Date</label>
                                    <input type="text"
                                           className="end-date ss-inline-end-date"
                                           data-date-autoclose="true"
                                           id="endDate"
                                           name="endDate"
                                           value={this.state.endDate}
                                           title="Enter the report end date"
                                           placeholder="MM/DD/YYYY"
                                    />
                                </fieldset>
                            </fieldset>
                        </form>
                    </div>
                    <div>
                        <p><a href={'api/reporting/all-buyers'} download>All Customers</a></p>
                        <p><a href={'api/reporting/all-suppliers'} download>All Partners</a></p>
                        <p><a href={'api/reporting/all-locations'} download>All Locations</a></p>
                        <p><a href={'api/reporting/locations-not-in-search'} download>Locations Not In Search</a></p>
                        <p><a href={'api/reporting/supplier-utilization?accountId=' + this.state.accountId + '&startDate=' + this.state.startDate + '&endDate=' + this.state.endDate} download>Booking Utilization At Partner: Partner Account ID = {this.state.accountId}, Start Date = {this.state.startDate}, End Date = {this.state.endDate}</a></p>
                    </div>
                </section>
            </div>
        )
    }
}

export default AdminReports;
