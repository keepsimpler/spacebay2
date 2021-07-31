import React, {Component} from 'react';
import '../css/views/manageUsers.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/components/badge.css';
import '../css/views/accountReport.css';
import '../css/views/search.css';
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import Busy from "../components/Busy";

import Error from "../components/Error";
import Select from "../components/Select";
import {AccountType, SubscriptionType, UserTypeName} from "../components/constants/securspace-constants";
import MultiSelect from "../components/multiSelect/MultiSelect";
import {requestLocations} from "../components/location/requests/location-requests";
import _ from "underscore";
import {getErrorMessageForStandardResponse} from "../util/NetworkErrorUtil";
import ManageExistingUsers from "../components/user/ManageExistingUsers";
import { requestUpdateUserAccessibleLocations } from "../components/user/request/user-requests"
import { toast } from 'react-toastify'

const $ = window.$;

const supplierRoleMap = new Map([
    [UserTypeName.GATE_CLERK, 'ROLE_USERTYPE_GATECLERK'],
    [UserTypeName.GATE_MANAGER, 'ROLE_USERTYPE_GATEMANAGER'],
    [UserTypeName.ADMIN, 'ROLE_USERTYPE_OWNER']
]);

const buyerRoleMap = new Map([
    [UserTypeName.DISPATCHER, 'ROLE_USERTYPE_DISPATCHER'],
    [UserTypeName.ADMIN, 'ROLE_USERTYPE_OWNER']
]);

export default class ManageUsers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            addNewUser: false,
            addUserErrorMessage: '',
            username: '',
            role: '',
            userToDelete: '',
            locations: [],
            locationOptions: [],
            selectedLocationIds: [],
            isLocationVisible: false,
        };
    }

    componentDidMount() {
        Busy.set(true);
        const promises = [
            this.loadAccountUsers(this.props.account ? this.props.account.id : null),
            requestLocations().then(resp => {
                const processedLocations = _.map(resp.body, (location) => {
                    return {
                        value: location.id,
                        displayName: location.locationName
                    }
                });

                this.setState({locations: resp.body});
                this.setState({locationOptions: processedLocations})
            })
              .catch(err => {
                  this.locationsFailedToLoad(getErrorMessageForStandardResponse(err));
              })
        ];
        Promise.allSettled(promises).finally(() => Busy.set(false));
    }

    loadAccountUsers = accountId => {
        if (accountId) {
            return $.ajax({
                url: 'api/account-users/' + accountId,
                type: 'GET',
                success: this.usersLoaded,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.usersFailedToLoad
            });
        }

    };

    usersFailedToLoad = () => {
        this.setState({errorMessage: "Failed to load users."});
    };

    locationsFailedToLoad = (errorMessage) => {
        this.setState({errorMessage: errorMessage});
    }

    usersLoaded = data => {
        this.setState({
            users: data
        });
    };

    addUser = () => {

       if (this.state.username) {
            if (!this.validateEmail(this.state.username)) {
                this.setState({
                    addUserErrorMessage: "Invalid email address."
                });
                return;
            }
        } else {
            this.setState({
                addUserErrorMessage: "Please enter an email address for the user."
            });
            return;
        }

        if (!this.state.role) {
            this.setState({
                addUserErrorMessage: "Please select a role for the user."
            });
            return;
        }


        Busy.set(true);
        $.ajax({
            url: 'api/account-users/',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: JSON.stringify({
                accountId: this.props.account.id,
                username: this.state.username,
                role: this.props.account.type === AccountType.SUPPLIER ? supplierRoleMap.get(this.state.role) : buyerRoleMap.get(this.state.role),
                locationIds: (this.state.isLocationVisible) ? this.state.selectedLocationIds : [],
            }),
            success: () => {
                this.setState({showAddNewUser: '', username: '', role: '', selectedLocationIds: [], isLocationVisible: false});
                this.loadAccountUsers(this.props.account.id).always(() => Busy.set(false));
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: () => {
                this.setState({
                    addUserErrorMessage: "There was an issue with creating this user.  Please contact support."
                });
                Busy.set(false);
            }
        });
    };

    handleChange = event => {
        let name = event.target.name;
        let value = event.target.value;
        const UPDATE_VISIBILITY_NAME = 'role';
        if ('username2' === name || 'username' === name) {
            this.setState({
                username: value,
                username2: value
            });
        } else {
            this.setState({[name]: value});
            if (name === UPDATE_VISIBILITY_NAME && this.props.account.type === AccountType.SUPPLIER) {
                if (value === UserTypeName.ADMIN) {
                    this.setState({isLocationVisible: false});
                } else {
                    this.setState({isLocationVisible: true});
                }
            }
        }
    };

    locationSelectionChange = locations => {
        this.setState({selectedLocationIds: locations});
    }

     getRoleBasedOptions = props => {
         if (props.account.type === AccountType.SUPPLIER) {
             if (props.account.subscriptionType === SubscriptionType.MARKETPLACE_ONLY) {
                 return [UserTypeName.ADMIN]
             } else {
                 return [UserTypeName.ADMIN, UserTypeName.GATE_CLERK, UserTypeName.GATE_MANAGER]
             }
         } else if (props.account.type === AccountType.BUYER) {
             return [UserTypeName.ADMIN, UserTypeName.DISPATCHER]
         }
     };

    validateEmail = email => {
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(email);
    };

    removeUserConfirm = user => {
        this.setState({userToDelete: user});
    };

    removeUser = user => {

        Busy.set(true);
        $.ajax({
            url: 'api/account-users/',
            type: 'DELETE',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: JSON.stringify({
                accountId: this.props.account.id,
                username: user.username,
                role: this.props.account.userType,
            }),
            success: () => {
                this.setState({userToDelete: ''});
                this.loadAccountUsers(this.props.account.id).always(() => Busy.set(false));
            },
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: () => {
                Busy.set(false);
            }
        })

    };

    redirectPage = page => {
        window.location.href=page;
    };

    updateUserLocations = (user, locationIds) => {
        Busy.set(true)
        requestUpdateUserAccessibleLocations(user.accountId, user.username, locationIds)
          .then((resp) => {
              this.loadAccountUsers(user.accountId).always(() => Busy.set(false))
          })
          .catch((err) => {
              Busy.set(false)
              toast.error("Unable to save user location access changes")
          })
    }

    render() {
        return (
            <div id="ssCompanyProfile" className="grey-bg hs-bookings-container h-100">
                <div>
                    <header>
                        <ul className="breadcrumb">
                            <li>Account</li>
                            <li>user management</li>
                        </ul>
                        <h1 className="content-header-title">User Management</h1>
                    </header>
                    <div className="white-container">
                        <div className="add-new-user hidden-lg hidden-md">
                            <div className="pointer  col-sm-12 col-xs-12"
                                 onClick={() => this.setState({showAddNewUser: !this.state.showAddNewUser})}>
                                <img alt="" src="/app-images/users/user@2x.png"/>
                                Add New User
                            </div>

                            <div
                                className={'transition-height ' + (this.state.showAddNewUser ? 'fadeInUp animated' : '')}>
                                {
                                    this.state.showAddNewUser ?
                                        <form className="ss-form ss-block">
                                            <div>
                                                <div>
                                                    <fieldset className="ss-stand-alone">
                                                        <label htmlFor="username2">EMAIL ADDRESS</label>
                                                        <input type="text"
                                                               id="username2"
                                                               name="username2"
                                                               placeholder="Enter the email address of the new user"
                                                               value={this.state.username2}
                                                               onChange={this.handleChange}
                                                        />
                                                    </fieldset>
                                                    <fieldset className="ss-stand-alone">
                                                        <label>ROLE</label>
                                                        <Select id="role"
                                                                name="role"
                                                                className="ss-bank-account-type"
                                                                handleChange={this.handleChange}
                                                                selectedOption={this.state.role}
                                                                placeholder="Choose"
                                                                options={this.getRoleBasedOptions(this.props)}
                                                        />
                                                    </fieldset>
                                                    {
                                                        this.state.isLocationVisible &&
                                                        <MultiSelect value={this.state.selectedLocationIds}
                                                                     options={this.state.locationOptions}
                                                                     onChange={this.locationSelectionChange}
                                                                     label={"LOCATIONS"}
                                                        />
                                                    }
                                                </div>


                                                {this.state.addUserErrorMessage ?
                                                    <Error>{this.state.addUserErrorMessage}</Error> : ''
                                                }
                                            </div>
                                            <div className="table text-center">
                                                <button type="button"
                                                        onClick={this.addUser}
                                                        className="ss-button-primary">Add User
                                                </button>
                                            </div>
                                        </form>
                                        :
                                        null
                                }
                            </div>
                        </div>
                        <div className="row-no-gutters">
                            <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12 add-user  hidden-sm hidden-xs">
                                <div className="add-new-user">
                                    <div className="pointer col-sm-12 col-xs-12 flex">
                                        <button className="ss-button-primary reverse" onClick={() => this.setState({showAddNewUser: !this.state.showAddNewUser})}>
                                            <img alt="" src="/app-images/users/user@2x.png"/>
                                            <span>Add New User</span>
                                            <span className="large-plus">+</span>
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className={'transition-height ' + (this.state.showAddNewUser ? 'fadeInUp animated' : '')}>
                                    {
                                        this.state.showAddNewUser ?
                                            <form className="ss-form ss-block">
                                                <div>
                                                    <div>
                                                        <fieldset className="ss-stand-alone">
                                                            <label htmlFor="username">EMAIL ADDRESS</label>
                                                            <input type="text"
                                                                   id="username"
                                                                   name="username"
                                                                   placeholder="Enter the email address of the new user"
                                                                   value={this.state.username}
                                                                   onChange={this.handleChange}
                                                            />
                                                        </fieldset>
                                                        <fieldset className="ss-stand-alone">
                                                            <label>ROLES</label>
                                                            <Select id="role"
                                                                    name="role"
                                                                    className="ss-bank-account-type"
                                                                    handleChange={this.handleChange}
                                                                    selectedOption={this.state.role}
                                                                    placeholder="Choose"
                                                                    options={this.getRoleBasedOptions(this.props)}
                                                            />
                                                        </fieldset>
                                                        {
                                                            this.state.isLocationVisible &&
                                                            <MultiSelect value={this.state.selectedLocationIds}
                                                                         options={this.state.locationOptions}
                                                                         onChange={this.locationSelectionChange}
                                                                         label={"LOCATIONS"}
                                                            />
                                                        }
                                                    </div>


                                                    {this.state.addUserErrorMessage ?
                                                        <Error>{this.state.addUserErrorMessage}</Error> : ''
                                                    }
                                                </div>
                                                <div className="table text-center">
                                                    <button type="button"
                                                            onClick={this.addUser}
                                                            className="ss-button-primary">Add User
                                                    </button>
                                                </div>
                                            </form>
                                            :
                                            null
                                    }
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-7 col-sm-12 col-xs-12">
                                <ManageExistingUsers
                                  users={this.state.users}
                                  locationOptions={this.state.locationOptions}
                                  onRemoveUser={this.removeUserConfirm}
                                  onUpdateLocations={this.updateUserLocations}
                                />

                                {this.state.userToDelete ?
                                    <div className="unselectable">
                                        <div className="modal-dialog">
                                            <div className="modal-content ">
                                                <div className="popup-header">
                                                    <h1>Confirm: Remove This User</h1>
                                                    <button type="button" className="close pull-right"
                                                            aria-label="Close"
                                                            onClick={() => this.setState({
                                                                userToDelete: ''
                                                            })}>
                                                        <img alt="" src="../app-images/close.png"/>
                                                    </button>
                                                </div>

                                                <form className="ss-form ss-block">
                                                    <div className="modal-footer">
                                                        <div className="table text-center">

                                                            <button type="button"
                                                                    onClick={() => this.setState({userToDelete: ''})}
                                                                    className="ss-button-secondary">Cancel
                                                            </button>
                                                            <button type="button"
                                                                    onClick={() => this.removeUser(this.state.userToDelete)}
                                                                    className="ss-button-primary">Remove User
                                                            </button>
                                                        </div>

                                                    </div>
                                                </form>

                                            </div>
                                        </div>
                                    </div>

                                    :
                                    ''}
                            </div>
                        </div>

                    </div>
                </div>



            </div>);


    }
}
