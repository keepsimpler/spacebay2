import React, {Component} from 'react';
import '../css/views/login.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/views/loginAsAccount.css';
import Error from "../components/Error";
import Busy from "../components/Busy";
import RedirectToHomePage from "../components/RedirectToHomePage";
import {AccountRefOption} from "../controls/AccountRefOption";
import Select from "../components/Select";

const $ = window.$;

class LoginAsAccount extends Component {
    constructor (props) {
        super(props);
        this.state = {
            selectedAccountRef: '',
            filterAccountRef: '',
            accountRefOptions: [],
            errorMessage: this.props.errorMessage,
            redirectToHome: false
        };
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    componentDidMount = () => {
        Busy.set(true);
        $.ajax({
            url: '/api/account/references',
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleAccountRefSuccess,
            error: this.handleFailure
        });
    };

    handleAccountRefSuccess = accountRefs => {
        Busy.set(false);
        this.setState({accountRefOptions: accountRefs.map(accountRef => new AccountRefOption(accountRef, true))});
    };

    handleSubmit = (event) => {
        Busy.set(true);
        $.ajax({
            url: '/api/login-as-account',
            data: JSON.stringify({
                id: this.state.selectedAccountRef.value
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            error: this.handleFailure
        });
        event.preventDefault();
    };

    handleSuccess = (loggedInAccount) => {
        Busy.set(false);
        this.props.handleAccountChange(loggedInAccount);
        this.setState({
            account: loggedInAccount,
            redirectToHome: true
        });
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Internal Server Error";
        this.setState({
            errorMessage: errorMessage
        });
    };



    render() {
        let submitButton;
        if(this.state.selectedAccountRef.value){
            submitButton = <button type="submit" className="ss-button-primary">Log In As Account</button>
        }else{
            submitButton = <button type="submit" disabled className="disabled ss-button-danger-primary">Log In As Account</button>
        }

        return (
            <div id="ssLogin" className="ss-main">
                <RedirectToHomePage accountType={this.state.account ? this.state.account.type : ''} userType={this.state.account ? this.state.account.userType : ''} redirectToHome={this.state.redirectToHome}/>
                <div className="ss-login-as-container">
                    <div id="ssLoginFormContainer">
                        <h2>Log in as another account</h2>
                        <form className="ss-form ss-block" onSubmit={this.handleSubmit} autoComplete="off">
                            <fieldset className="ss-stand-alone">
                                <label htmlFor="username">LOGIN AS ACCOUNT</label>

                                <Select id="selectedAccountRef"
                                        name="selectedAccountRef"
                                        handleChange={this.handleChange}
                                        className="ss-account-select"
                                        selectedOption={this.state.selectedAccountRef}
                                        placeholder="Choose"
                                        options={this.state.accountRefOptions}
                                        canSearch="1"
                                />
                            </fieldset>
                            {
                                this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ""
                            }
                            {submitButton}

                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default LoginAsAccount;