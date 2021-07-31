import React, {Component} from 'react';
import {Redirect} from "react-router-dom";
import { UserType } from "./constants/securspace-constants";

class RedirectToHomePage extends Component {


    render() {
        return (
            <div>
                {
                    this.props.redirectToHome ?
                        this.props.attemptedUrlPath && this.props.attemptedUrlSearch && this.props.currentUserHasAccessToAttemptedUrlPath ?
                            <Redirect to={{
                                pathname: this.props.attemptedUrlPath,
                                search: this.props.attemptedUrlSearch
                            }}/>
                            :
                            this.props.attemptedUrlPath && this.props.currentUserHasAccessToAttemptedUrlPath ?
                                <Redirect to={this.props.attemptedUrlPath}/>
                                :
                                this.props.accountType === 'Supplier' && (!this.props.userType || this.props.userType === 'OWNER' || this.props.userType === 'ADMIN') ?
                                    <Redirect to="/locations-profile"/>
                                    :
                                    this.props.accountType === 'Supplier' && this.props.userType === 'GATEMANAGER' ?
                                        <Redirect to="/approvals"/>
                                        :
                                        this.props.accountType === 'Supplier' && this.props.userType === 'GATECLERK' ?
                                            <Redirect to="/check-in"/>
                                            :
                                            this.props.accountType === 'Buyer' && this.props.userType === 'DISPATCHER' ?
                                                <Redirect to="/search"/>
                                                :
                                                this.props.accountType === 'Buyer' && (!this.props.userType || this.props.userType === 'OWNER' || this.props.userType === 'ADMIN') ?
                                                    <Redirect to="/search"/>
                                                    :
                                                    this.props.accountType === 'Admin' && this.props.userType === 'ADMIN'?
                                                        <Redirect to="/login-as-account"/>
                                                        :
                                                        this.props.userType === UserType.THIRD_PARTY_ADMIN ?
                                                            <Redirect to="/partner-details" />
                                                            :
                                                            ''
                        :
                        ''
                }
            </div>
        )
    }
}

export default RedirectToHomePage;
