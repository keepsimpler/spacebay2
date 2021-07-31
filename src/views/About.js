import React, {Component} from 'react';
import Team from '../components/Team';
import '../css/theme/mainContent.css';
import '../css/views/about.css';
import {Helmet} from "react-helmet";
import { GlobalModalContext } from "../context/global-modal-context";

class About extends Component {
    static contextType = GlobalModalContext

    constructor(props) {
        super(props);

        this.state = {
            page: 'company',
            url: window.location.href
        };
    }

    setPage = val => {
        this.setState({"page": val});
    };


    render() {

        const globalModalContext = this.context
        const { showSignUpModal } = globalModalContext
        return (
            <div className="about">
                <Helmet>
                    <title>About SecurSpace | Semi Truck Parking Nationwide</title>
                    <meta name="keywords" content="semi truck parking" />
                    <meta name="description"
                          content="SecurSpace is an online marketplace that connects companies looking for parking and storage options to those with dedicated or excess capacity." />
                    <link rel="canonical" href={this.state.url} />
                </Helmet>

                <header className="grey-bg">
                    <h1 className="content-header-title">About SecurSpace </h1>
                    <div className="content-header-description">
                        SecūrSpace is an online marketplace that connects companies looking for parking and storage options to those with dedicated or excess capacity. Our platform was built to combat issues caused by the lack of adequate space in cities and near major highways and interstates.
                        Businesses and individuals around the world contend with this issue on a daily basis - solving this problem is our specialty.
                    </div>

                    <div className="switch">
                        <div>
                            <span className={(this.state.page === 'company') ? 'active' : ''}
                                  onClick={e => this.setPage('company')}>ABOUT COMPANY</span>
                            <span className={(this.state.page === 'team') ? 'active' : ''}
                                  onClick={e => this.setPage('team')}>OUR TEAM</span>
                        </div>
                    </div>
                </header>
                <br/>
                {this.state.page === 'company' ?
                    <div>
                        <div className="about-solve-panel-trucks flex">
                            <div></div>
                            <div>
                                <img class="about-solve-panel-trucks-img" alt="SecūrSpace" src="../app-images/logo/envase_secur_space_logo_color.png"/>
                                <h2>SecūrSpace creates opportunities for our Partners and Customers</h2>
                                <p>Through our marketplace, SecūrSpace <strong>Partners</strong> gain access to a vast network of potential Customers who need their excess real estate capacity. We help our Partners generate new revenue and provide
                                    the tools to manage this new business simply and seamlessly through our Gate Management System.</p>
                                <br/>
                                <p>
                                    <strong>Customers</strong> use our marketplace every day to reserve parking and storage for commercial vehicles, overnight truck parking, trailer and container drop yards, and many other needs. If your team needs a secure location to park a loaded trailer tonight or you're looking for
                                    a flexible solution for a project in a new city, SecūrSpace is your one-stop solution.
                                </p>
                                <span className="pointer" onClick={()=>{
                                     showSignUpModal()
                                }}>
                                    <button className="orange-button">SIGN UP NOW &nbsp;&rarr;</button>
                                </span>
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        <header>
                            <h1 className="content-header-title">Our Team</h1>
                            <div className="content-header-description">
                                We are a unique group, driven by a passion to help our customers solve a key operational
                                challenge - finding the space they need when they need it.
                            </div>
                        </header>
                        <Team/>
                    </div>
                }
            </div>
        )
    }
}

export default About;
