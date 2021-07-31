import React, {Component} from 'react';
import '../css/theme/mainContent.css';
import '../css/views/howItWorks.css';
import {Helmet} from "react-helmet";
import { GlobalModalContext } from "../context/global-modal-context";

const $ = window.$;
const customerText = [

    {
        title: 'Sign Up',
        body: 'Create an account for your company and complete your profile'
    },
    {
        title: 'Search',
        body: '<a href="/search">Search</a> our Partner listings by typing in the city or ' +
            'address where you need space as well as the desired date range. Use the Equipment Type and Location ' +
            'Features dropdown menus to narrow results to the perfect location'
    },
    {
        title: 'Request Space',
        body: 'Select the location that meets your needs and book the space!'
    },
    {
        title: 'Confirmation',
        body: 'Partners have 30 minutes to respond to your request. If you need immediate confirmation,' +
            ' book one of our Instant Approval space (blue icons on the search map) or reach out to us directly via phone or email'
    }

];


const partnerText = [
    {
        title: 'Sign Up',
        body: 'Create an account with SecurSpace; one of our team members will reach out to you to finalize your account and ' +
            'location listing to ensure all information is accurate'
    },
    {
        title: 'Track Requests',
        body: 'SecurSpace will automatically send you requests from Customers who want to book your location!' +
            ' You have 30 minutes to respond to these requests'
    },
    {
        title: 'Sign Up For Instant Approval',
        body: 'Talk to a SecurSpace team member to set up your account on auto-pilot!' +
            ' Our system can manage your extra spaces and track this for you!'
    },
    {
        title: 'Keep Us Informed',
        body: 'Did you move? Grow? Downsize? Let us know so we can ensure you\'re maximizing' +
            ' parking and storage revenue! Many of our Partners also use us to' +
            ' find flexible real estate solutions in new cities so reach out if this is something we can help you with!'
    }
];

class HowItWorks extends Component {
    static contextType = GlobalModalContext

    constructor(props) {
        super(props);


        this.state = {
            customerStep: 0,
            customerStepText: customerText[0].body,
            partnerStep: 0,
            partnerStepText: partnerText[0].body,
            url: window.location.href
        };
    }


    partnerScroll = value => {
        let allLi = $('.for-partner .for-scroll li');
        setTimeout(function () {
            let left = 0;
            if (value > 1) {
                for (let j = 0; j < value; j++) {
                    left += $(allLi[j]).innerWidth();
                }
            }
            $('.for-partner .for-scroll').animate({scrollLeft: left}, 500);
        }, 200);
    };

    customerScroll = value => {
        let allLi = $('.for-customer .for-scroll li');
        setTimeout(function () {
            let left = 0;
            if (value > 1) {
                for (let j = 0; j < value; j++) {
                    left += $(allLi[j]).innerWidth();
                }
            }
            $('.for-customer .for-scroll').animate({scrollLeft: left}, 500);
        }, 200);
    };

    selectOption = (type, step) => {
        if (type === 'partner') {
            this.setState({partnerStep: step, partnerStepText: partnerText[step].body});
            this.partnerScroll(step);
        }
        if (type === 'customer') {
            this.setState({customerStep: step, customerStepText: customerText[step].body});
            this.customerScroll(step);
        }
    };

    setStep = (type, step) => {
        let newValue = 0;
        if (type === 'partner') {
            let value = this.state.partnerStep;
            if (step === -1 && value === 0) {
                return;
            }
            if (step === 1 && value === (partnerText.length - 1)) {
                return;
            }
            newValue = value + step;
            if (newValue >= partnerText.length) {
                newValue = partnerText.length - 1;
            }
        }

        if (type === 'customer') {
            let value = this.state.customerStep;

            if (step === -1 && value === 0) {
                return;
            }
            if (step === 1 && value === (customerText.length - 1)) {
                return;
            }
            newValue = value + step;
            if (newValue >= customerText.length) {
                newValue = customerText.length - 1;
            }
        }
        this.selectOption(type, newValue);

    };

    openSignUpModal = () => {
        const globalModalContext = this.context
        const { showSignUpModal } = globalModalContext
        showSignUpModal()
    }

    render() {

        return (
            <div className="grey-bg how_it_works">
                <Helmet>
                    <title>Secure Storage and Parking | SecurSpace</title>
                    <meta name="keywords" content="secure storage"/>
                    <meta name="description"
                          content="Whether you're looking for a secure space to park your truck or trailer, or looking to rent out space to a customer, we have the solution for you."/>
                    <link rel="canonical" href={this.state.url}/>
                </Helmet>
                <header>
                    <h1 className="content-header-title">How it Works</h1>
                    <div className="content-header-description">SecurSpace enables on demand access to a rapidly growing
                        network of industrial
                        facilities and businesses searching for parking and storage solutions. Sign up as a
                        Customer or Partner today!
                    </div>
                </header>
                <br/>
                <div className="container">
                    <div className="w100 for-customer">
                        <div className="for-start">
                            <img alt="" src="../app-images/how/customer.png"/>
                            <div>
                                <img alt="" src="../app-images/how/user.png"/>
                                <span>
                                SIGN UP AS A<br/>
                                <h2>Customer</h2>
                            </span>
                                <br/>
                                <span className="pointer" onClick={() => {
                                    this.openSignUpModal()
                                }}>
                                    GET STARTED
                                </span>
                            </div>
                        </div>


                        <div className="wizard">
                            <div className="for-scroll">
                                <ul>
                                    {
                                        customerText
                                            .map((customerItem, index) =>
                                                <li key={index}
                                                    onClick={() => this.selectOption('customer', index)}
                                                    className={(this.state.customerStep === index) ? 'active' : ''}>
                                                    <h4>{customerItem.title}</h4>
                                                </li>
                                            )

                                    }
                                </ul>
                            </div>

                            <div>
                                <button className="prevBtn how-it-works-scroll-button" onClick={(e) => this.setStep('customer', -1)}>
                                    <img className="how-it-works-scroll-btn-image" alt="" src="../app-images/how/customer_arrow.png"/>
                                    <br/>
                                    PREV
                                </button>
                                <img alt="" src="../app-images/how/icon_customer.png"/>
                                <span className="how-it-works-scroll-text-container" dangerouslySetInnerHTML={{__html: this.state.customerStepText}}/>
                                <button className="how-it-works-scroll-button" onClick={(e) => this.setStep('customer', 1)}>
                                    <img className="how-it-works-scroll-btn-image" alt="" src="../app-images/how/customer_arrow.png"/>
                                    <br/>
                                    NEXT
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="w100 for-partner">
                        <div className="for-start">
                            <img alt="" src="../app-images/how/partner.png"/>
                            <div>
                                <img alt="" src="../app-images/how/user.png"/>
                                <span>
                                SIGN UP AS A<br/>
                                <h2>Partner</h2>
                            </span>
                                <br/>
                                <span className="pointer" onClick={() => {
                                    this.openSignUpModal()
                                }}>
                                    GET STARTED
                                </span>
                            </div>
                        </div>
                        <div className="wizard">

                            <div className="for-scroll">
                                <ul>
                                    {
                                        partnerText
                                            .map((partnerItem, index) =>
                                                <li key={index}
                                                    onClick={() => this.selectOption('partner', index)}
                                                    className={(this.state.partnerStep === index) ? 'active' : ''}>
                                                    <h4>{partnerItem.title}</h4>
                                                </li>
                                            )

                                    }
                                </ul>
                            </div>
                            <div>
                                <button className="prevBtn how-it-works-scroll-button" onClick={(e) => this.setStep('partner', -1)}>
                                    <img className="how-it-works-scroll-btn-image" alt="" src="../app-images/how/partner_arrow.png"/>
                                    <br/>
                                    PREV
                                </button>
                                <img alt="" src="../app-images/how/icon_partner.png"/>
                                <span className="how-it-works-scroll-text-container" dangerouslySetInnerHTML={{__html: this.state.partnerStepText}}/>
                                <button className="how-it-works-scroll-button" onClick={(e) => this.setStep('partner', 1)}>
                                    <img className="how-it-works-scroll-btn-image" alt="" src="../app-images/how/partner_arrow.png"/>
                                    <br/>
                                    NEXT
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default HowItWorks;
