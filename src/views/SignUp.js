import React, {Component} from 'react';
import URLUtils from '../util/URLUtils';
import '../css/views/signUp.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import Error from "../components/Error";
import Busy from "../components/Busy";
import AccountTypeSelector from "../components/AccountTypeSelector";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import Recaptcha from "react-recaptcha";
import FirebaseLogin from '../components/FirebaseLogin';
import CheckBox from "../components/CheckBox";
import { GlobalModalContext } from "../context/global-modal-context";
import PropTypes from 'prop-types'

const $ = window.$;

const PARTNER_ID_HTA = "1000";

class SignUp extends Component {
    static contextType = GlobalModalContext

    static propTypes = {
        handleNavigateToLogin: PropTypes.func.isRequired,
        handleNavigateToSignup: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            type: 'Buyer',
            email: (props.socialLoginTemporaryUser && props.socialLoginTemporaryUser.user) ? props.socialLoginTemporaryUser.user.email : '',
            companyName: '',
            firstName: (props.socialLoginTemporaryUser && props.socialLoginTemporaryUser.user) ? props.socialLoginTemporaryUser.user.first_name : '',
            lastName: (props.socialLoginTemporaryUser && props.socialLoginTemporaryUser.user) ? props.socialLoginTemporaryUser.user.last_name : '',
            username: '',
            password: '',
            confirmPassword: '',
            signupFailed: false,
            errorMessage: '',
            redirectToHome: false,
            partnerId: '',
            sourceId: '',
            phoneNumber: '',
            isVerified: false,
            showAlert: false,
            alertMessage: '',
            alertTitle: '',
            agreementAccepted: false,
            signForm: (props.socialLoginTemporaryUser && props.socialLoginTemporaryUser.user ? 1: null),
            idToken: (props.socialLoginTemporaryUser && props.socialLoginTemporaryUser.user) ? props.socialLoginTemporaryUser.user.idToken : null,
        };



        this.captchaKey = "6LdyW6UUAAAAABFEKiLQV6Io3JkTQjSoj_kmdRFz";

        this.verifyCallback = this.verifyCallback.bind(this);
        this.recaptchaInstance = null;
    }


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.socialLoginTemporaryUser !== nextProps.socialLoginTemporaryUser) {
            this.setState({
                type: 'Buyer',
                email: (nextProps.socialLoginTemporaryUser && nextProps.socialLoginTemporaryUser.user) ? nextProps.socialLoginTemporaryUser.user.email : '',
                firstName: (nextProps.socialLoginTemporaryUser && nextProps.socialLoginTemporaryUser.user) ? nextProps.socialLoginTemporaryUser.user.first_name : '',
                lastName: (nextProps.socialLoginTemporaryUser && nextProps.socialLoginTemporaryUser.user) ? nextProps.socialLoginTemporaryUser.user.last_name : '',
                idToken: (nextProps.socialLoginTemporaryUser && nextProps.socialLoginTemporaryUser.user) ? nextProps.socialLoginTemporaryUser.user.idToken : '',
            });
        }
    }

    componentDidMount() {
        $(".navbar-collapse").collapse('hide');
        let selectedAccountType = URLUtils.getQueryVariable('type');
        if (selectedAccountType) {
            this.setState({type: selectedAccountType});
        }

        let partnerId = URLUtils.getQueryVariable('partnerId');
        if (partnerId) {

            $.ajax({
                url: 'api/source',
                data: JSON.stringify({
                    token: partnerId
                }),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: this.handleStatisticsSuccess
            });
        }

        const incomingType = this.props.location.search.includes('Supplier') ? 'Supplier' : 'Buyer';

        this.setState({partnerId: partnerId, type: incomingType});
    }

    handleStatisticsSuccess = statisticsId => {
        this.setState({sourceId: statisticsId})
    };

    handleChange = event => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
        this.setState({[name]: value});
    };

    handleSuccessSm = (loggedInAccount, user) => {
        Busy.set(false);

        let noAccountForUser = 'anonymousUser' === loggedInAccount.username;
        let accountToUse = noAccountForUser ? {} : loggedInAccount;
        this.props.handleAccountChange(accountToUse);



        this.setState({
            account: accountToUse,
            errorMessage: noAccountForUser ? "" : "",
            redirectToHome: noAccountForUser ? false :true,
            signForm: noAccountForUser ? 1 : null,
        });

        if(noAccountForUser){
            this.setState({
                type: 'Buyer',
                email: (user && user.email) ? user.email : '' ,
                firstName: (user && user.first_name) ? user.first_name : ''  ,
                lastName: (user && user.last_name) ? user.last_name : '',
                idToken: (user && user.idToken) ? user.idToken : '',
            });
        }else{
            this.props.cancel(); //close modal
        }


    };

    handleSubmit = event => {
        event.preventDefault();
        if (!this.state.isVerified) {
            this.setState({
                errorMessage: "Please verify that you are a human"
            });
            return;
        }

        if (!this.state.firstName) {
            this.setState({errorMessage: "Please enter your first name."});
            return;
        }
        if (!this.state.lastName) {
            this.setState({errorMessage: "Please enter your last name."});
            return;
        }
        if (!this.state.email) {
            this.setState({errorMessage: "Please enter an email address."});
            return;
        }
        if (!this.state.phoneNumber) {
            this.setState({errorMessage: "Please enter a phone number."});
            return;
        }
        if (this.state.phoneNumber.length>10) {
            this.setState({errorMessage: "Phone number must be at maximum 10 characters."});
            return;
        }
        if (!SignUp.validateEmail(this.state.email)) {
            this.setState({errorMessage: "Email address is invalid."});
            return;
        }
        if (!this.state.agreementAccepted) {
            this.setState({errorMessage: "Please accept the agreements."});
            return;
        }
        if (!this.state.password) {
            this.setState({errorMessage: "Please enter a password."});
            return;
        }
        if (this.state.password.length < 8) {
            this.setState({errorMessage: "Password must be at least 8 characters."});
            return;
        }
        if (this.state.password !== this.state.confirmPassword) {
            this.setState({errorMessage: "Passwords don't match."});
        } else {
            Busy.set(true);
            this.setState({
                errorMessage: ""
            });

            if (this.state.idToken) {
                $.ajax({
                    url: '/api/firebaseSignup?token=' + this.state.idToken,
                    data: JSON.stringify({
                        id: '',
                        type: this.state.type,
                        email: this.state.email,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        username: this.state.email,
                        password: this.state.password,
                        companyName: this.state.companyName,
                        companyDescription: '',
                        addressLatitude: '',
                        addressLongitude: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        zip: '',
                        phoneNumber: this.state.phoneNumber,
                        partnerId: this.state.sourceId,
                        thirdPartyId: this.props.thirdPartyId
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleSuccess,
                    error: this.handleFailedSignup
                });
            } else {
                $.ajax({
                    url: 'api/signup',
                    data: JSON.stringify({
                        id: '',
                        type: this.state.type,
                        email: this.state.email,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        username: this.state.email,
                        password: this.state.password,
                        companyName: this.state.companyName,
                        companyDescription: '',
                        addressLatitude: '',
                        addressLongitude: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        zip: '',
                        phoneNumber: this.state.phoneNumber,
                        partnerId: this.state.sourceId,
                        thirdPartyId: this.props.thirdPartyId
                    }),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: "json",
                    success: this.handleSuccess,
                    error: this.handleFailedSignup
                });
            }
        }
    };

    handleSuccess = signedInAccount => {
        Busy.set(false);
        this.recaptchaInstance.reset();
        this.props.cancel();
        this.setState((state, props) => {
            return {
                account: signedInAccount,
                redirectToHome: true
            }
        });
        this.props.handleAccountChange(signedInAccount);
    };

    handleFailedSignup = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.recaptchaInstance.reset();
        this.setState({
            signupFailed: false,
            errorMessage: jqXHR.responseJSON ? jqXHR.responseJSON.message : "Account creation failed!"
        });
    };

    static validateEmail(email) {
        if (email && email.endsWith("@mail.ru")) {
            return false;
        }
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(email);
    }

    verifyCallback = (response) => {
        if (response) {
            this.setState({isVerified: true});
        }
    }

    handleFailedLoginByMessage = errorMessage => {
        Busy.set(false);
        this.setState({
            errorMessage: errorMessage
        });
    };

    toggleForm = () => {
        this.setState({"signForm": 1})
    };

    onClose = () => {
        this.setState({showAlert: false});
    }

    render() {
        const globalModalContext = this.context
        const { showTermsModal, showPrivacyModal } = globalModalContext
        return (

            <div>
                <div>


                    <div className="popup-header">
                        <img alt=""
                             src="https://s3-us-west-1.amazonaws.com/securspace-files/app-images/plus.png"/>
                        <h1>Sign up to SecūrSpace</h1>
                        <span className="pointer">
                            <img alt=""
                                 src="../app-images/close.png"
                                 onClick={this.props.cancel}/>
                        </span>
                    </div>


                    <div className={this.state.signForm ? "hidden" : ""}>
                        <fieldset>
                            <FirebaseLogin
                                handleSignUpNavigation={() => this.props.handleNavigateToSignup()}
                                fromSignUp="1"
                                handleFailed={this.handleFailedLoginByMessage}
                                handleSuccess={this.handleSuccessSm}
                                setSocialLoginUser={this.props.setSocialLoginUser}
                                thirdPartyId={this.props.thirdPartyId}
                            />
                        </fieldset>

                        <div className="w100 text-center social-login-separator">or</div>

                        <button className="w100 orange-button" type="button" onClick={this.toggleForm}>Sign up with
                            email
                        </button>

                    </div>


                    {
                        (this.state.signForm && this.state.partnerId === PARTNER_ID_HTA) ?
                            <div style={{width: "50%", display: "inline-block"}}>
                                <img alt="HTA" style={{
                                    width: "150px",
                                    position: "relative",
                                    top: "20px",
                                    right: "-115px"
                                }}
                                     src="https://s3-us-west-1.amazonaws.com/securspace-files/partner-images/HTA+logo.jpg"
                                />
                                <p style={{
                                    position: "relative",
                                    top: "10px",
                                    right: "-115px",
                                    fontWeight: "600"
                                }}>HTA Driver Advantage
                                </p>
                            </div>
                            :
                            null
                    }
                    <form onSubmit={this.handleSubmit} className={this.state.signForm ? "login-form" : "hidden"}>
                        <div className="signup-account-type-selector">
                            <div>ACCOUNT TYPE</div>
                            <AccountTypeSelector type={this.state.type}
                                                 stateHook={(value) => this.setState({type: value})}/>
                        </div>
                        <fieldset className="border-bottom">
                            <label>COMPANY</label>
                            <input type="text"
                                   name="companyName"
                                   value={this.state.companyName}
                                   onChange={this.handleChange}
                                   placeholder="Please enter your company name"
                            />
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label htmlFor="firstName">FIRST NAME</label>
                            <input type="text"
                                   name="firstName"
                                   value={this.state.firstName}
                                   onChange={this.handleChange}
                                   placeholder="Enter your first name"
                            />
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label htmlFor="lastName">LAST NAME</label>
                            <input type="text"
                                   name="lastName"
                                   value={this.state.lastName}
                                   onChange={this.handleChange}
                                   placeholder="Enter your last name"
                            />
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label htmlFor="phoneNumber">PHONE NUMBER</label>
                            <input type="text"
                                   name="phoneNumber"
                                   value={this.state.phoneNumber}
                                   onChange={this.handleChange}
                                   maxLength={10}
                                   placeholder="Please enter your phone number"
                            />
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label htmlFor="email">EMAIL</label>
                            <input type="email"
                                   name="email"
                                   value={this.state.email}
                                   onChange={this.handleChange}
                                   placeholder="Enter your email"
                            />
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label htmlFor="password">PASSWORD</label>
                            <input type="password"
                                   id="signupPassword"
                                   name="password"
                                   value={this.state.password}
                                   onChange={this.handleChange}
                                   autoComplete="new-password"
                                   placeholder="Create a password with at least 8 characters"
                            />
                            <div className="meter">
                                <PasswordStrengthMeter password={this.state.password}/>
                            </div>
                        </fieldset>
                        <fieldset className="border-bottom">
                            <label htmlFor="confirmPassword">CONFIRM</label>
                            <input type="password"
                                   id="confirmPassword"
                                   name="confirmPassword"
                                   value={this.state.confirmPassword}
                                   onChange={this.handleChange}
                                   autoComplete="new-password"
                                   placeholder="Repeat your password"
                            />
                            <div className="meter">
                                <PasswordStrengthMeter password={this.state.confirmPassword}/>
                            </div>
                        </fieldset>
                        <fieldset>
                            <label className="ss-checkbox">
                                <CheckBox checked={this.state.agreementAccepted}
                                          onCheck={(value) => this.setState({agreementAccepted: value})}>
                                    <div className="signup-terms">I agree to the SecurSpace&nbsp;
                                        <span className="pointer" onClick={()=> showTermsModal(2)}>Terms Of Use</span>
                                        &nbsp;and&nbsp;
                                        <span className="pointer" onClick={()=> showPrivacyModal(2)}>Privacy Policy</span>, as well as our partner <a
                                        href="https://www.dwolla.com/legal/tos/"
                                        target="_blank"
                                        rel="noopener noreferrer">Dwolla's Terms of Service</a> and <a href="https://www.dwolla.com/legal/privacy/"
                                                                                                       target="_blank"
                                                                                                       rel="noopener noreferrer">Privacy Policy</a>
                                    </div>
                                </CheckBox>
                            </label>
                        </fieldset>
                        <fieldset>
                            <Recaptcha
                                sitekey={this.captchaKey}
                                render="explicit"
                                ref={e => this.recaptchaInstance = e}
                                verifyCallback={this.verifyCallback}
                            />
                        </fieldset>
                        {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}
                        <fieldset className="fieldset-up">
                            <div>
                                <button type="submit" className="orange-button ss-action-button">
                                    AGREE &amp; SIGN UP
                                </button>
                            </div>
                        </fieldset>
                        <div className="clear"></div>
                    </form>
                    <div className="pointer login-signup-panel">
                        <div  onClick={() => this.props.handleNavigateToLogin()}>
                            <img alt="" className="footer-login-signup-icon"
                                 src="../app-images/registerplus.png"/>
                            <span
                                className="footer-signup-login-text">Already have an account?{this.props.type}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SignUp;
