import React, {Component} from 'react';
import 'css/components/NoSupplierList.css';

import Busy from "../components/Busy";
import Error from "../components/Error";

import {Link} from "react-router-dom";

const $ = window.$;

class NoSupplierList extends Component {
    constructor(props) {
        super(props);

        this.state = Object.assign({
            contactName: '',
            contactEmail: '',
            contactLocation: props.location,
            successMessage: false,
            errorMessage: ''
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.state.contactLocation) {
            this.setState({contactLocation: nextProps.location});
        }
    }

    validateEmail(email) {
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(email);
    }


    handleSubmit = event => {

        this.setState({errorMessage: ''});

        if (!this.state.contactLocation) {
            this.setErrorMessage("Please enter a location");
            return;
        }


        if (!this.state.contactName) {
            this.setErrorMessage("Please enter a contact name");
            return;
        }

        if (!this.state.contactEmail) {
            this.setErrorMessage("Please enter a contact email address");
            return;
        }

        if (!this.validateEmail(this.state.contactEmail)) {
            this.setErrorMessage("Please enter a valid email address");
            return;
        }

        let fields = [
            {
                "name": "firstname",
                "value": this.state.contactName
            },
            {
                "name": "email",
                "value": this.state.contactEmail
            },
            {
                "name": "location_name_on_website",
                "value": this.props.location
            }
        ];


        $.ajax({
            url: 'https://api.hsforms.com/submissions/v3/integration/submit/3473416/7f3d64c9-3bbf-48b4-a59c-be64593d35c3',
            data: JSON.stringify({fields}),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            error: this.handleFailure
        });
    };

    handleSuccess = contact => {
        this.setState({successMessage: contact.inlineMessage});
    };

    handleFailure = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        let errorMessage = jqXHR.responseJSON.errors ? jqXHR.responseJSON.errors[0].message : "";
        errorMessage = errorMessage ? errorMessage : (jqXHR.responseJSON ? jqXHR.responseJSON.message : "Wrong request");
        this.setErrorMessage(errorMessage);
    };

    handleChange = event => {

        //Clear out success and error messages when the user begins editing again.
        this.setState({
            updateSuccessful: false,
            errorMessage: ''
        });


        let name = event.target.name;
        let value = event.target.value;


        this.setState({[name]: value});

    };

    setErrorMessage(message) {
        Busy.set(false);
        this.setState({
            updateSuccessful: false,
            errorMessage: message
        });
    }

    generateContactContent = () => {
        let content = <div>Need Help? Reach out to <Link
            to="/contact"><strong>Secūr<span>Space</span></strong></Link> for help!
        </div>

        if(this.props.navigateToContact) {
            content = <div>Need Help? Reach out to <span className="cursor-pointer" onClick={() => this.props.navigateToContact()}>
                <strong>Secūr<span>Space</span></strong></span> for help!
            </div>
        }

        return content
    }

    render() {

        return (
            <div className="no-results">

                <div>
                    <div className="row1">
                        <span className="pull-left">
                            {this.props.location ?
                                <h1 className="ss-supplier-list-title">{this.props.displayName} {this.props.justParking ? "Secure Parking" : "Secure Storage & Parking"}</h1>
                                :
                                null
                            }
                            <h2 className="ss-supplier-list-subtitle">{this.props.justParking ? "No parking found at this location" : "No available spaces found matching your search"}</h2>
                        </span>
                    </div>
                    {!this.state.successMessage ?
                        <div className="row2">
                            <div className="col-xl-5 col-lg-5 col-md-5 col-sm-12 hidden-xs no-padding">
                                <img className="pull-left" alt="" src="../app-images/contact/mail-no-location.svg"/>
                                <br/>
                                <div className="w100 pull-left">Be the first to know
                                    when this location will be
                                    available
                                </div>
                            </div>
                            <form className="col-xl-7 col-lg-7 col-md-7 col-sm-12 col-xs-12"
                                  method="post"
                                  action="https://forms.hubspot.com/uploads/form/v2/3473416/f34600f9-f9ef-4efc-9118-6f47e688a027">
                                <div className="w100 pull-left">
                                    <fieldset>
                                        <label>LOCATION</label>
                                        <input type="text"
                                               readOnly
                                               name="contactLocation"
                                               value={this.state.contactLocation}
                                               onChange={this.handleChange}
                                               placeholder="Enter a location name"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label>NAME</label>
                                        <input type="text"
                                               name="contactName"
                                               value={this.state.contactName}
                                               onChange={this.handleChange}
                                               placeholder="Enter a contact name"
                                        />
                                    </fieldset>
                                    <fieldset>
                                        <label>E-MAIL</label>
                                        <input type="email"
                                               name="contactEmail"
                                               value={this.state.contactEmail}
                                               onChange={this.handleChange}
                                               placeholder="Enter an email where we can reach you"
                                        />
                                    </fieldset>

                                </div>

                                {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}
                                {this.state.successMessage ? <h4>{this.state.successMessage}</h4> : ''}

                                <div className="w100 pull-left">
                                    <p>
                                        We won’t provide your personal information to any third parties.
                                    </p>
                                </div>
                                <div>
                                    <button type="button" className="w100 orange-button "
                                            disabled={this.state.successMessage}
                                            onClick={this.handleSubmit}>KEEP ME INFORMED
                                    </button>
                                </div>


                            </form>
                        </div>
                        :
                        <div className="row2 sent-email">
                            <img className="center-block" alt="" src="../app-images/contact/sent-mail-no-location.svg"/>
                            <br/>
                            <div className="w100 pull-left">
                                <h1>We received your request!</h1>
                            </div>
                            <div className="w100 pull-left">You will receive a message regarding your requested location
                                as soon as it will be available.
                            </div>
                        </div>
                    }
                </div>
                <div className="need-help">
                    {this.generateContactContent()}
                </div>
            </div>
        )
    }
}

export default NoSupplierList;
