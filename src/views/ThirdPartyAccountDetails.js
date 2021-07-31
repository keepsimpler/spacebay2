import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ThirdPartyPartnerDetailsForm from "../components/thirdPartyManagement/ThirdPartyPartnerDetailsForm";
import ThirdPartyPaymentManagement from "../components/thirdPartyManagement/ThirdPartyPaymentManagement";
import classNames from 'classnames'

import '../css/views/thirdPartyAccountDetails.css'
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';
import '../css/theme/mainContent.css';
import '../css/views/signUp.css'

export default class ThirdPartyAccountDetails extends Component {
    static propTypes = {
        thirdPartyUser: PropTypes.shape({
            thirdParty: PropTypes.object.isRequired
        })
    }

    constructor(props) {
        super(props);

        this.state = {
            showEditContactDetails: false,
            showPartnerDetails: true,
            showPaymentMethods: false
        }
    }

    showPartnerDetails = () => {
        this.setState({
            showPartnerDetails: true,
            showPaymentMethods: false
        })
    }

    showPaymentDetails = () => {
        this.setState({
            showPartnerDetails: false,
            showPaymentMethods: true
        })
    }

    render() {
        const {thirdPartyUser} = this.props
        const {thirdParty} = thirdPartyUser || {}

        return thirdPartyUser && thirdParty ? (
            <div className="grey-bg h-100">
                <div className="partner-details-container h-100">
                    <div className="partner-profile-header-container">
                        <h1>Partner Profile - {thirdParty.companyName} </h1>
                    </div>
                    <div className="partner-details-content-container h-100">

                        <div className="partner-nav-container">
                            <div className={classNames("partner-nav-item", {"active": this.state.showPartnerDetails})} onClick={this.showPartnerDetails}>
                                Partner Details
                            </div>
                            <div className={classNames("partner-nav-item", {"active": this.state.showPaymentMethods})} onClick={this.showPaymentDetails}>
                                Payment Methods
                            </div>
                        </div>


                        {
                            this.state.showPartnerDetails && <ThirdPartyPartnerDetailsForm thirdParty={thirdParty} onAuthorityUpdate={this.props.onAuthorityUpdate} />
                        }

                        {
                            this.state.showPaymentMethods && <ThirdPartyPaymentManagement authority={thirdPartyUser} />
                        }


                    </div>
                </div>
            </div>
        ) : null
    }
}
