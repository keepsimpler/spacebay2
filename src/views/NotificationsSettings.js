import React, {Component} from 'react';
import Busy from "../components/Busy";
import {createLogoutOnFailureHandler} from '../util/LogoutUtil';

import {toast} from 'react-toastify';
import ReactTooltip from 'react-tooltip'
import {AccountType, UserTypeName} from "../components/constants/securspace-constants";
import 'css/notification-settings.css'

const $ = window.$;
const NOTIFICATIONS_TYPES_SUPPLIER = ['Administrative', 'Partner_Yard_Management'];
const NOTIFICATIONS_TOOLTIPS_SUPPLIER = {
    Administrative: 'Receive emails when payments fail for Customer bookings and overages.',
    Partner_Yard_Management: 'Receive emails when Customer bookings are created, updated, requested, or cancelled.'
};

const NOTIFICATIONS_TYPES_BUYER = ['Administrative', 'Fleet_Management'];
const NOTIFICATIONS_TOOLTIPS_BUYER = {
    Administrative: 'Receive emails when invoices are created, adjusted, or refunded and when payments succeed or fail.',
    Fleet_Management: 'Receive emails when bookings are created, updated, requested, approved, declined, or cancelled.'
};

const OWNER_ROLE = "ACCOUNTOWNER";

class NotificationsSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            account: this.props.account,
            rolesLabels: [],
            roles: []
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.account !== nextProps.account) {
            this.setState({
                account: nextProps.account
            });
        }
    }

    componentDidMount() {
        this.getData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.account !== prevState.account) {
            this.getData();
        }
    }

    createEmptyNotificationsSettings() {
        let temp = {};

        for (let i = 0; i < this.state.notifications_type.length; i++) {
            if (typeof temp[this.state.notifications_type[i]] == "undefined") {
                temp[this.state.notifications_type[i]] = [];
            }
            temp[this.state.notifications_type[i]].push(OWNER_ROLE);
        }
        return temp;
    }

    handleChange = event => {
        let element = event.target;
        let type = $(element).data("type");
        let role = $(element).data("role");
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
        let data = this.state.data;
        if (typeof data[type] == 'undefined') {
            data[type] = [];
        }
        if (value && !data[type].includes(role)) {
            //add role
            data[type].push(role);
        }
        if (!value) {
            //exclude role
            var index = data[type].indexOf(role);
            if (index !== -1) data[type].splice(index, 1);
        }
        this.setState({data: data});
    };

    handleUseLocationRestrictionsChange = (event) => {
        this.setState({useLocationRestrictions: event.target.checked})
    }

    handleSubmit = () => {
        let _this = this;
        let apiMethod = '../api/save-notification-settings';

        Busy.set(true);
        $.ajax({
            url: apiMethod,
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(
                {
                    accountId: _this.state.account.id,
                    values: JSON.stringify(_this.state.data),
                    useLocationRestrictions: this.state.useLocationRestrictions
                }
            ),
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            success: (data) => {
                Busy.set(false);
                toast.success("Notifications Settings saved!");
            },
            error: (err) => {
                Busy.set(false);
                console.log(err);
                err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
                _this.setState({
                    error: err,
                    data: null
                });
            }
        });
    };

    getData() {
        if (!(this.state.account && this.state.account.id)) return;
        let _this = this;
        let apiMethod = '../api/get-notification-settings?accountId=' + this.state.account.id;

        this.setState({rolesLabels: this.props.account.type === AccountType.SUPPLIER ? [UserTypeName.ACCOUNT_OWNER, UserTypeName.GATE_CLERK, UserTypeName.GATE_MANAGER, UserTypeName.ADMIN] : [UserTypeName.ACCOUNT_OWNER, UserTypeName.DISPATCHER, UserTypeName.ADMIN]});
        this.setState({roles: this.props.account.type === AccountType.SUPPLIER ? ["ACCOUNTOWNER", "GATECLERK", "GATEMANAGER", "OWNER"] : ["ACCOUNTOWNER", "DISPATCHER", "OWNER"]});
        this.setState({
            notifications_type: this.props.account.type === AccountType.SUPPLIER ?  NOTIFICATIONS_TYPES_SUPPLIER : NOTIFICATIONS_TYPES_BUYER
        });

        Busy.set(true);
        $.ajax({
            url: apiMethod,
            type: 'GET',
            success: (data) => {
                Busy.set(false);
                if (!data.values) {
                    this.setState({data: _this.createEmptyNotificationsSettings(), error: null, useLocationRestrictions: false});
                } else {
                    let userNotifications=JSON.parse(data.values);

                    Object.keys(userNotifications).forEach((key) => {

                        if(this.state.notifications_type.indexOf(key)=== -1){
                            delete userNotifications[key];
                        }
                    });

                    this.setState({data: userNotifications, error: null, useLocationRestrictions: data.useLocationRestrictions});
                }
            },
            error: (err) => {
                Busy.set(false);
                err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
                _this.setState({
                    error: err,
                    data: null
                });
            }
        });
    }

    render() {
        return (
            <div className="ss-main h-100">
                <div className="page-content">
                    <h1 className="page-title" style={{marginTop: "40px"}}>Notifications Settings</h1>
                    <div className="container" style={{marginTop: "40px"}}>
                        {this.state.error ?
                            <h4 className="text-danger">
                                {this.state.error.customMessage ? this.state.error.customMessage : "ERROR!"}
                                ‌</h4>
                            :
                            ""
                        }
                        <table className="table  fixed table-bordered">
                            <thead>
                            <tr>
                                <th>Notification Category</th>
                                {
                                    this.state.rolesLabels.map((field, index) =>
                                        <th key={index.toString()}>
                                            {field}
                                        </th>
                                    )
                                }
                            </tr>
                            </thead>
                            {this.state.data ?
                                <tbody>
                                {
                                    this.state.notifications_type.map((fieldN, indexN) =>
                                        <tr key={indexN.toString()}>
                                            <td>
                                                <label htmlFor={"ID" + indexN.toString()}>{fieldN.replace(/_/g,' ')}<span data-tip
                                                                                                        data-for={"ID" + indexN.toString()}
                                                                                                        className="location-name-tip">&#x24d8;</span></label>
                                                <ReactTooltip id={"ID" + indexN.toString()} type="success"
                                                              effect="solid" className="location-name-tip-hover">
                                                    <span>{
                                                        this.props.account.type === 'Supplier' ?
                                                            NOTIFICATIONS_TOOLTIPS_SUPPLIER[fieldN] :
                                                            NOTIFICATIONS_TOOLTIPS_BUYER[fieldN]
                                                        }</span>
                                                </ReactTooltip>

                                            </td>
                                            {
                                                this.state.roles.map((fieldR, indexR) =>
                                                    <td key={indexR.toString()}>
                                                        <label className={"ss-checkbox"}
                                                               key={indexN.toString() + indexR.toString()}>
                                                            <input type="checkbox"
                                                                   checked={ this.state.data[fieldN.toString()] && (this.state.data[fieldN.toString()].includes(fieldR.toString()))}
                                                                   data-role={fieldR.toString()}
                                                                   data-type={fieldN.toString()}
                                                                   name={fieldN.toString() + "_" + fieldR.toString()}
                                                                   onChange={this.handleChange}
                                                            />
                                                        </label>
                                                    </td>
                                                )
                                            }
                                        </tr>
                                    )
                                }
                                </tbody>

                                : <tbody>
                                <tr></tr>
                                </tbody>
                            }
                        </table>
                        <br/>

                        {
                            this.props.account.type === AccountType.SUPPLIER && this.state.data &&
                            <div className="use-location-restrictions-container">
                                <div className="use-location-restrictions-prompt-text">Use Location Restrictions?</div>
                                <div>
                                    <label htmlFor="use-location-restrictions-tooltip">
                                    <span data-tip
                                          data-for={"use-location-restrictions-tooltip"}
                                          className="location-name-tip">&#x24d8;
                                    </span>
                                    </label>
                                    <ReactTooltip id="use-location-restrictions-tooltip" type="success" effect="solid" className="location-name-tip-hover">
                                    <span>
                                        If checked, only users who have access to the location associated with the
                                        notification will receive the notification where applicable. User location
                                        associations can be set up in the Users section of your account.
                                    </span>
                                    </ReactTooltip>
                                </div>
                                <div className="use-location-restrictions-input-container">
                                    <input
                                      type="checkbox"
                                      checked={this.state.useLocationRestrictions}
                                      onChange={this.handleUseLocationRestrictionsChange}
                                    />
                                </div>
                            </div>
                        }
                        <div className="ss-button-container">
                            <button type="button" className="ss-button-primary" onClick={this.handleSubmit}>Save
                            </button>
                        </div>
                        <br/>
                    </div>
                </div>

                <div>

                </div>
            </div>
        );
    }
}

export default NotificationsSettings;
