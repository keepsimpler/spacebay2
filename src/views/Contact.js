import React, {Component} from 'react';
import '../css/views/contact.css';
import '../css/theme/mainContent.css';
import Busy from "../components/Busy";
import Error from "../components/Error";
import {createLogoutOnFailureHandler} from "../util/LogoutUtil";
import classNames from 'classnames'

import {Helmet} from "react-helmet";
import Select from "../components/Select";

const $ = window.$;

class Contact extends Component {
    constructor(props) {
        super(props);
        this.state = Object.assign({
            firstName: '',
            lastName: '',
            company: '',
            email: '',
            phone: '',
            ticketConcern: '',
            bookingNumber: '',
            invoiceNumber: '',
            content: '',
            updateSuccessful: false,
            errorMessage: '',
            doneEditingContactForm: false,
            url: window.location.href
        });
    }


    handleSubmit = event => {

        this.setState({errorMessage: ''});

        if (!this.state.firstName) {
            this.setErrorMessage("Please enter a first name");
            return;
        }
        if (!this.state.lastName) {
            this.setErrorMessage("Please enter a last name");
            return;
        }
        if (!this.state.company) {
            this.setErrorMessage("Please enter a company name");
            return;
        }
        if (!this.state.email) {
            this.setErrorMessage("Please enter a contact email address");
            return;
        }
        if (!Contact.validateEmail(this.state.email)) {
            this.setErrorMessage("Please enter a valid email address");
            return;
        }
        if (!this.state.content) {
            this.setErrorMessage("Please enter a description");
            return;
        }

        let requestBody = {
            fields: [
                {
                    "name": "firstname",
                    "value": this.state.firstName
                }
                ,
                {
                    "name": "lastname",
                    "value": this.state.lastName
                },
                {
                    "name": "company",
                    "value": this.state.company
                },
                {
                    "name": "email",
                    "value": this.state.email
                },
                {
                    "name": "phone",
                    "value": this.state.phone
                },
                {
                    "name": "TICKET.ticket_concern",
                    "value": this.state.ticketConcern
                },
                {
                    "name": "TICKET.booking_number",
                    "value": this.state.bookingNumber
                },
                {
                    "name": "TICKET.invoice_number",
                    "value": this.state.invoiceNumber
                },
                {
                    "name": "TICKET.content",
                    "value": this.state.content
                }
            ]
        };

        $.ajax({
            url: 'https://api.hsforms.com/submissions/v3/integration/submit/3473416/7a7961df-f589-4b0a-bc4e-ab6687afedab',
            data: JSON.stringify(requestBody),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: "json",
            success: this.handleSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(this.props.handleLogout)
            },
            error: this.handleFailure
        });
    };

    handleSuccess = contact => {
        this.setState({doneEditingContactForm: true});
        this.setState({
            firstName: '',
            lastName: '',
            company: '',
            email: '',
            phone: '',
            ticketConcern: '',
            bookingNumber: '',
            invoiceNumber: '',
            content: ''
        })
        //(contact.inlineMessage);
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

        if ('phone' === name && (!Contact.isInteger(value) || value > 9999999999)) {
            return;
        }

        this.setState({[name]: value});

    };

    setErrorMessage(message) {
        Busy.set(false);
        this.setState({
            updateSuccessful: false,
            errorMessage: message
        });
    }

    static isInteger(x) {
        return x.indexOf('.') < 0 && x % 1 === 0;
    }

    static validateEmail(email) {
        let reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(email);
    }

    generateCloseButton = () => {
        if(this.props.onClose) {
            return (
                <div onClick={this.props.onClose} className="contact-close-container">
                    <img alt="Close" className="contact-close-image" src="../app-images/close.png" />
                </div>
            )
        }
    }

    render() {
        const shouldShowCloseButton = this.props.onClose
        return (
            <div id="contact-page" className="grey-bg h-100">
                <Helmet>
                    <title>Contact SecurSpace | A Secure Parking Solution</title>
                    <meta name="keywords" content="secure parking"/>
                    <meta name="description"
                          content="Contact SecurSpace today and let us know where we can help you find the perfect space."/>
                    <link rel="canonical" href={this.state.url}/>
                </Helmet>
                <header>
                    <div className="contact-header-container">
                        <div className={classNames("contact-header-close", { "hidden" : !shouldShowCloseButton})}>{ this.generateCloseButton() }</div>
                        <div className={"contact-header-main-text-container"}>
                            <h1 className={classNames("content-header-title", { "shortened-header-padding" : shouldShowCloseButton})}>Contact Us</h1>
                        </div>

                    </div>
                    <div className="content-header-description">Get in touch with us by leaving a message and a member
                        of our team will reach out to you.
                    </div>
                </header>
                <div className="container flex">
                    <div className="relative">
                        <div className="contact-page-info-item">
                            <img alt="" src="../app-images/contact/address.png"/>
                            <div>
                                <h3>ADDRESS</h3>
                                <span>
                                    809 W Hill Street, Suite C-14, Charlotte, NC 28208
                                </span>
                            </div>
                        </div>

                        <div className="contact-page-info-item">
                            <img alt="" src="../app-images/contact/phone.png"/>
                            <div>
                                <h3>
                                    PHONE
                                </h3>
                                <span>
                                    <a href="tel:1-833-875-7275" target="_blank" rel="noopener noreferrer">1-833-875-7275</a>
                                </span>
                            </div>
                        </div>
                        <div className="contact-page-info-subtext">
                            Support Hours Mon-Fri 8AM-5PM EST
                        </div>

                        <div className="contact-page-info-item">
                            <div>
                                <span>
                                    <a href="/faq">Have questions? Find helpful answers on our FAQ Page</a>
                                </span>
                            </div>
                        </div>

                        <div className="contact-page-social-networks-panel">
                            <div>FOLLOW US ON SOCIAL NETWORKS</div>
                            <div>
                                <a href="https://www.facebook.com/securspacemarket" target="_blank"
                                   rel="noopener noreferrer">
                                    <img alt="" src="../app-images/contact/facebook.png"/>

                                </a>
                                <a href="https://twitter.com/secur_space" target="_blank" rel="noopener noreferrer">
                                    <img alt="" src="../app-images/contact/tweeter.png"/>
                                </a>
                                <a href="https://www.youtube.com/channel/UCpCAy1E2ZHCQ-Z-Xq-UWUDw" target="_blank"
                                   rel="noopener noreferrer">
                                    <img alt="" src="../app-images/contact/youtube.png"/>
                                </a>
                                <a href="https://www.instagram.com/securspace/?hl=en" target="_blank"
                                   rel="noopener noreferrer">
                                    <img alt="" src="../app-images/contact/instagram.png"/>
                                </a>
                                <a href="https://www.linkedin.com/company/securspace" target="_blank"
                                   rel="noopener noreferrer">
                                    <img alt="" src="../app-images/contact/linkedin.png"/>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div id="contact-page-form-panel">
                        {this.state.doneEditingContactForm ?
                            <div className="thank_you">
                                <img alt="" src="../app-images/contact/thank_you_icon.svg"/>
                                <h2 className='text-center'>Thank you for contacting SecūrSpace!</h2>
                                <p>We will contact you as soon as possible</p>
                            </div>
                            :
                            <form method="post"
                                  action="https://forms.hubspot.com/uploads/form/v2/3473416/f34600f9-f9ef-4efc-9118-6f47e688a027">
                                <div>
                                    <fieldset>
                                        <label>HOW CAN WE HELP?</label>
                                        <Select id="ticketConcern"
                                                name="ticketConcern"
                                                className="ss-ticket-concern-select"
                                                handleChange={this.handleChange}
                                                selectedOption={this.state.ticketConcern}
                                                placeholder="Choose"
                                                options={[
                                                    "New Customer- Help Finding Parking",
                                                    "New Partner - Help Listing Your Location",
                                                    "General Account Questions",
                                                    "Current Booking Questions",
                                                    "Billing (Invoices, Overages, Payouts)",
                                                    "Other"
                                                ]}
                                        />
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <span>
                                            <label>FIRST NAME<sup>*</sup></label>
                                            <input type="text"
                                                   name="firstName"
                                                   value={this.state.firstName}
                                                   onChange={this.handleChange}
                                                   placeholder="Enter fist name"
                                            />
                                        </span>
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <span>
                                            <label>LAST NAME<sup>*</sup></label>
                                            <input type="text"
                                                   name="lastName"
                                                   value={this.state.lastName}
                                                   onChange={this.handleChange}
                                                   placeholder="Enter last name"
                                            />
                                        </span>
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <label>COMPANY<sup>*</sup></label>
                                        <input type="text"
                                               name="company"
                                               value={this.state.company}
                                               onChange={this.handleChange}
                                               placeholder="Enter company name"
                                        />
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <label>E-MAIL<sup>*</sup></label>
                                        <input type="text"
                                               name="email"
                                               value={this.state.email}
                                               onChange={this.handleChange}
                                               placeholder="Enter an email where we can reach you"
                                        />
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <label>PHONE</label>
                                        <input type="text"
                                               name="phone"
                                               value={this.state.phone}
                                               onChange={this.handleChange}
                                               placeholder="Enter a phone number where we can reach you"
                                        />
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <label>BOOKING NUMBER</label>
                                        <input type="text"
                                               name="bookingNumber"
                                               value={this.state.bookingNumber}
                                               onChange={this.handleChange}
                                               placeholder="Enter a Booking # if your request is regarding a Booking"

                                        />
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <label>INVOICE NUMBER</label>
                                        <input type="text"
                                               name="invoiceNumber"
                                               value={this.state.invoiceNumber}
                                               onChange={this.handleChange}
                                               placeholder="Enter an Invoice # if your request is regarding billing"

                                        />
                                        <hr/>
                                    </fieldset>
                                    <fieldset>
                                        <label>DESCRIPTION<sup>*</sup></label>
                                        <textarea
                                            name="content"
                                            value={this.state.content}
                                            onChange={this.handleChange}
                                            placeholder="Any specific details can be entered here."
                                        />
                                        <hr/>
                                    </fieldset>
                                </div>

                                {this.state.errorMessage ? <Error>{this.state.errorMessage}</Error> : ''}

                                <div>
                                    <button type="button" className="w100 orange-button "
                                            onClick={this.handleSubmit}>Submit
                                    </button>
                                </div>


                            </form>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Contact;
