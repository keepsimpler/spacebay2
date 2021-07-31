import React, {Component} from 'react';
import { withRouter } from "react-router";
import Success from "../components/Success";
import Error from "../components/Error";
import Busy from "../components/Busy";
import FirebaseLogin from '../components/FirebaseLogin';
import { GlobalModalContext } from "../context/global-modal-context";
import URLUtils from "../util/URLUtils";
import PropTypes from 'prop-types'
import "../css/views/login.css";


const $ = window.$;

class Login extends Component {
    static contextType = GlobalModalContext

    static propTypes = {
        handleForgotPasswordNavigation: PropTypes.func.isRequired,
        handleSignUpNavigation: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        const timedOut = URLUtils.getQueryVariable('timeout')
        const loggedOut = URLUtils.getQueryVariable('loggedOut')

        this.state = {
            username: '',
            password: '',
            remember: 1,
            errorMessage: this.props.errorMessage ? this.props.errorMessage : '',
            redirectToHome: false,
            sessionTimedOut: timedOut,
            loggedOut: loggedOut
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.loggedOut !== this.props.loggedOut) {
            this.safeSetState({loggedOut: nextProps.loggedOut});
        } else if (nextProps.sessionTimedOut !== this.props.sessionTimedOut) {
            this.safeSetState({sessionTimedOut: nextProps.sessionTimedOut});
        }
    }

    componentWillUnmount() {
        this.mounted = false
    }

    componentDidMount () {
        this.mounted = true
    }

    safeSetState = (changes) => {
        if(this.mounted) {
            this.setState(changes)
        }
    }

    handleChange = event => {
        if (this.state.redirectToHome) return;
        let value = (event.target.type === 'checkbox' ) ? event.target.checked : event.target.value;
        this.safeSetState({[event.target.name]: value});
    };

    handleSubmit = event => {
        Busy.set(true);

        $.ajax({
            url: '/api/login',
            data: JSON.stringify({
                "username": this.state.username,
                "password": this.state.password,
                "thirdPartyId": this.props.thirdPartyId,
                "remember-me-param": (this.state.remember === 1) ? true : false
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            error: this.handleFailedLogin
        });

        event.preventDefault();
    };

    handleSuccess = loggedInAccount => {
        Busy.set(false);
        let noAccountForUser = 'anonymousUser' === loggedInAccount.username;
        let accountToUse = noAccountForUser ? {} : loggedInAccount;

        this.props.cancel();
        this.safeSetState({
            account: accountToUse,
            errorMessage: noAccountForUser ? "No account found for given username" : "",
            loggedOut: false,
            sessionTimedOut: false
        });

        this.props.handleAccountChange(accountToUse);
    };

    handleFailedLogin = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        if (errorMessage && "Bad credentials" === errorMessage.trim()) {
            errorMessage = "Invalid username or password";
        }
        this.safeSetState({
            errorMessage: errorMessage,
            loggedOut: false,
            sessionTimedOut: false
        });
    };

    handleFailedLoginByMessage = errorMessage => {
        Busy.set(false);
        this.safeSetState({
            errorMessage: errorMessage,
            loggedOut: false,
            sessionTimedOut: false
        });
    };

    redirectModal = event => {
        this.props.clearSocialLoginUser();
        this.props.history.push("/signup")
    };

    render() {
        return (
            <div>
                <div>
                    <div className="popup-header">
                        <img alt=""
                             src="https://s3-us-west-1.amazonaws.com/securspace-files/app-images/login.png"/>
                        <h1>Log In</h1>
                        <span className="pointer">
                            <img alt=""
                                 src="../app-images/close.png"
                                 onClick={this.props.cancel}/>
                        </span>
                    </div>
                    <form onSubmit={this.handleSubmit} className="login-form">
                        <fieldset className="border-bottom">
                            <label>EMAIL</label>
                            <input type="text"
                                   id="username"
                                   name="username"
                                   value={this.state.username}
                                   onChange={this.handleChange}
                                   autoComplete="on"
                                   placeholder="Please enter your email"
                            />
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label>PASSWORD</label>
                            <input type="password"
                                   id="password"
                                   name="password"
                                   value={this.state.password}
                                   onChange={this.handleChange}
                                   autoComplete="on"
                                   placeholder="Type your password"
                            />
                            <div className="pointer forgot-password"
                                 onClick={() => {
                                     this.props.handleForgotPasswordNavigation()
                                 }}>
                                FORGOT PASSWORD?
                            </div>
                        </fieldset>
                        <fieldset>
                            <label className="ss-checkbox">
                                <input type="checkbox"
                                       className="ss-checkbox-container-checkbox"
                                       name="remember"
                                       checked={this.state.remember}
                                       value="1"
                                       onChange={this.handleChange}
                                />Remember me?
                            </label>
                        </fieldset>
                        <fieldset>
                            <button type="submit" className="orange-button ss-action-button">
                                LOG IN
                            </button>
                        </fieldset>
                        <fieldset>
                            <FirebaseLogin
                                handleSignUpNavigation={this.props.handleSignUpNavigation}
                                handleFailed={this.handleFailedLoginByMessage}
                                handleSuccess={this.handleSuccess}
                                setSocialLoginUser={this.props.setSocialLoginUser}
                                thirdPartyId={this.props.thirdPartyId}
                            />
                        </fieldset>
                        <div className="login-message-container">
                        {
                            this.state.sessionTimedOut ? <Success>Session timed out. Please login again.</Success>
                                : this.state.loggedOut ? <Success>Successfully logged out</Success>
                                :
                                this.state.errorMessage ?
                                    <Error>{this.state.errorMessage}</Error>
                                    :
                                    ""
                        }
                        </div>

                        <div className="clear"></div>
                    </form>
                    <div className="pointer login-signup-panel">
                        <div onClick={() => {
                            this.props.clearSocialLoginUser();
                            this.props.handleSignUpNavigation()
                        }}>
                            <img alt="" className="footer-login-signup-icon"
                                 src="../app-images/registerplus.png"/>
                            <span className="footer-signup-login-text">Register a new account</span>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Login);
