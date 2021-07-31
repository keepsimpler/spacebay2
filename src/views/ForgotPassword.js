import React, {Component} from 'react';
import Error from "../components/Error";
import Success from "../components/Success";
// import '../css/views/forgotPassword.css';
import Busy from "../components/Busy";

const $ = window.$;

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            resetSuccessful: false,
            errorMessage: ''
        };
    }

    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    handleSubmit = event => {
        Busy.set(true);
        $.ajax({
            url: 'api/reset-password',
            data: JSON.stringify({
                "username": this.state.username
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            success: this.handleSuccess,
            error: this.handleFailure
        });
        event.preventDefault();
    };

    handleSuccess = data => {
        Busy.set(false);
        this.setState({
            resetSuccessful: true,
            errorMessage: ''
        });
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Password reset failed";
        this.setState({
            resetSuccessful: false,
            errorMessage: errorMessage
        });
    };

    render() {
        return (
            <div>
                <div>
                    <div className="popup-header">
                        <img alt="" src="https://s3-us-west-1.amazonaws.com/securspace-files/app-images/login.png"/>
                        <h1>Forgot your password?</h1>
                        <span className="pointer">
                            <img alt=""
                                 src="../app-images/close.png"
                                 onClick={this.props.cancel}/>
                        </span>

                    </div>

                    <form onSubmit={this.handleSubmit} className="login-form">
                        <fieldset>
                            <p className="forgot-password-instructions">Enter your email address to reset your password.
                                You may
                                need to check your spam folder or unblock no-reply@secur.space</p>
                        </fieldset>
                        <fieldset className="login-fieldset" id="usernameFieldset">
                            <label htmlFor="username">EMAIL</label>
                            <input type="text"
                                   id="username"
                                   name="username"
                                   value={this.state.username}
                                   onChange={this.handleChange}
                                   placeholder="Please enter your email"
                            />
                            <hr/>
                        </fieldset>
                        <fieldset>
                            <button className="orange-button ss-action-button" type="submit">Submit</button>
                        </fieldset>
                        {
                            this.state.errorMessage ?
                                <Error>{this.state.errorMessage}</Error>
                                :
                                ''
                        }
                        {
                            this.state.resetSuccessful ?
                                <Success>Password reset email sent. Click the link in the email to change your
                                    password.</Success>
                                :
                                ''
                        }
                        <div className="clear"></div>
                    </form>
                </div>
            </div>
        )
    }
}

export default ForgotPassword;
