import React, {Component} from 'react';
import URLUtils from '../util/URLUtils';
import Busy from "../components/Busy";
import Error from "../components/Error";
import '../css/views/changePassword.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import {toast} from 'react-toastify';
import { GlobalModalContext } from "../context/global-modal-context";


const $ = window.$;

class ChangePassword extends Component {
    static contextType = GlobalModalContext

    constructor(props) {
        super(props);
        this.state = {
            changePassword: '',
            changePasswordConfirm: '',
            passwordChangeSuccessful: false,
            errorMessage: ''
        };
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    handleSubmit = event => {
        event.preventDefault();

        this.setState({
            passwordChangeSuccessful: false,
            errorMessage: ''
        });

        if (!this.state.changePassword) {
            this.setState({errorMessage: "Please enter a password."});
            return;
        }
        if (this.state.changePassword.length < 8) {
            this.setState({errorMessage: "Password must be at least 8 characters."});
            return;
        }
        if (this.state.changePassword !== this.state.changePasswordConfirm) {
            this.setState({errorMessage: "Passwords don't match."});
            return;
        }

        Busy.set(true);

        $.ajax({
            url: 'api/change-password',
            data: JSON.stringify({
                "token": URLUtils.getQueryVariable('token'),
                "password": this.state.changePassword
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: this.handleSuccess,
            error: this.handleFailure
        });
    };

    handleSuccess = data => {
        Busy.set(false);
        let successMessage = this.props.isNewUser ? "Successfully set password!" : "Successfully changed password!";
        toast.success(successMessage);

        const globalModalContext = this.context
        const { showLoginModal } = globalModalContext
        showLoginModal()
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        toast.error('Password change failed');
    };

    render() {
        return (
            <div className="grey-bg">
                {
                    this.props.isNewUser ?
                        <header>
                            <h1 className="content-header-title">Welcome to SecūrSpace!</h1>
                            <div className="content-header-description">Please set a password for your new account.</div>
                        </header>
                        :
                        <header>
                            <h1 className="content-header-title">Change your password</h1>
                            <div className="content-header-description">Please enter a new password.
                            </div>
                        </header>
                }
                <div id="ssChangePasswordFormContainer" className="container flex">
                    <div>
                        <form className="ss-form ss-block" onSubmit={this.handleSubmit}>
                            <fieldset className="ss-top">
                                <label htmlFor="password">{this.props.isNewUser ? "NEW PASSWORD" : "PASSWORD"}</label>
                                <input type="password"
                                       id="changePassword"
                                       name="changePassword"
                                       value={this.state.changePassword}
                                       onChange={this.handleChange}
                                       autoComplete="new-password"
                                       placeholder="Create a password with at least 8 characters"
                                />
                            </fieldset>
                            <fieldset id="changePasswordConfirmFieldset" className="ss-bottom">
                                <label htmlFor="confirmPassword">CONFIRM</label>
                                <input type="password"
                                       id="changePasswordConfirm"
                                       name="changePasswordConfirm"
                                       value={this.state.changePasswordConfirm}
                                       onChange={this.handleChange}
                                       autoComplete="new-password"
                                       placeholder="Repeat your password"
                                />
                            </fieldset>
                            {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}
                            <button type="submit" className="ss-button-primary">{this.props.isNewUser ? "Set Password" : "Change Password"}</button>
                        </form>
                    </div>

                </div>

            </div>
        )
    }
}

export default ChangePassword;
