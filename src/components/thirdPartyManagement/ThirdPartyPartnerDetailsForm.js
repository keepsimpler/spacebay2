import React, { Component } from 'react'
import ThirdPartyPartnerDetailsField from "./ThirdPartyPartnerDetailsField";
import classNames from 'classnames'
import request from '../../util/SuperagentUtils';
import PropTypes from 'prop-types'
import { getErrorMessageForStandardResponse } from "../../util/NetworkErrorUtil";
import _ from 'underscore'

import 'css/third-party-partner-details-form.css'

export default class ThirdPartyPartnerDetailsForm extends Component {
    static propTypes = {
        thirdParty: PropTypes.object.isRequired,
        onAuthorityUpdate: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        const { thirdParty } = props

        this.state = {
            email: thirdParty.contactEmail,
            firstName: thirdParty.contactFirstName,
            lastName: thirdParty.contactLastName,
            submitting: false,
            errorMsg: null,
            successMsg: null
        }
    }

    updateThirdPartyDetails = () => {
        let errorMsg

        if(!this.state.email || _.isEmpty(this.state.email)) {
            errorMsg = "An email is required"
        } else if(!this.state.firstName || _.isEmpty(this.state.firstName)) {
            errorMsg = "A first name is required"
        } else if(!this.state.lastName || _.isEmpty(this.state.lastName)) {
            errorMsg = "A last name is required"
        }

        if(errorMsg) {
           this.setState({errorMsg})
        } else {
            this.setState({errorMsg: null, successMsg: null, submitting: true})

            const { thirdParty } = this.props

            request
                .put(`/api/third-party/${thirdParty.id}/details`)
                .send(this.state)
                .then(this.handleSuccessfulDetailsUpdate)
                .catch(this.handleFailedDetailsUpdates)

        }
    }

    handleSuccessfulDetailsUpdate = (resp) => {
        this.setState({
            submitting: false,
            errorMsg: null,
            successMsg: "Changes saved"
        })

        this.props.onAuthorityUpdate(resp.body);
    }

    handleFailedDetailsUpdates = (err) => {
        const errorMsg = getErrorMessageForStandardResponse(err)

        this.setState({
            submitting: false,
            errorMsg: errorMsg,
            successMsg: null
        })
    }

    changeValue = (event) => {
        let name = event.target.name
        let value = event.target.value

        this.setState({[name]: value})
    }

    render() {
        const { thirdParty } = this.props
        return (
            <div className="third-party-partner-details-form-container">
                <ThirdPartyPartnerDetailsField
                    name="thirdPartyId"
                    label="PARTNER ID"
                    value={thirdParty.id}
                    type="textarea"
                    disabled={true}
                />

                <ThirdPartyPartnerDetailsField
                    name="authKey"
                    label="PARTNER KEY"
                    value={thirdParty.authKey}
                    disabled={true}
                />

                <ThirdPartyPartnerDetailsField
                    name="email"
                    label="CONTACT EMAIL*"
                    value={this.state.email}
                    onChange={this.changeValue}
                />

                <ThirdPartyPartnerDetailsField
                    name="firstName"
                    label="CONTACT FIRST NAME*"
                    value={this.state.firstName}
                    onChange={this.changeValue}
                />

                <ThirdPartyPartnerDetailsField
                    name="lastName"
                    label="CONTACT LAST NAME*"
                    value={this.state.lastName}
                    onChange={this.changeValue}
                />

                <div className="third-party-partner-details-button-containers">
                    {
                        this.state.errorMsg && <div className="ss-error third-party-partner-details-message-container">{this.state.errorMsg}</div>
                    }
                    {
                        this.state.successMsg && <div className="ss-success third-party-partner-details-message-container">{this.state.successMsg}</div>
                    }
                    <div onClick={this.updateThirdPartyDetails}
                         className={classNames("ss-button-primary third-party-partner-details-form-submit-button", { "disabled": this.state.submitting })}>
                        Save Changes
                    </div>
                </div>

            </div>
        )
    }
}
