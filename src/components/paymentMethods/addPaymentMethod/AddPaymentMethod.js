import React, { Component } from 'react'
import { requestPaymentProcessorEnvironmentDetails } from "../request/payment-method-requests";
import { getErrorMessageForStandardResponse } from "../../../util/NetworkErrorUtil";
import AddPaymentMethodModal from "./AddPaymentMethodModal";

import PropTypes from 'prop-types'

export default class AddPaymentMethod extends Component {

    static propTypes = {
        authority: PropTypes.shape({
            authorityId: PropTypes.string.isRequired,
            userType: PropTypes.string.isRequired,
            contactEmail: PropTypes.string.isRequired
        }),
        bypassDwolla: PropTypes.bool,
        onPaymentMethodAdded: PropTypes.func,
        disablePaymentMethod: PropTypes.string
    }

    constructor() {
        super();

        this.state = {
            addPaymentMethodModalOpen: false
        }

        requestPaymentProcessorEnvironmentDetails()
            .then((env) => this.setState({env}))
            .catch((err) => this.setState({errorMsg: getErrorMessageForStandardResponse(err)}))
    }

    setAddPaymentMethodModalVisibility = (visible: boolean) => {
        this.setState({ addPaymentMethodModalOpen: visible })
    }

    onPaymentMethodAdded = () => {
        this.setAddPaymentMethodModalVisibility(false)
        const { onPaymentMethodAdded } = this.props

        if(onPaymentMethodAdded) {
            onPaymentMethodAdded()
        }

    }

    render() {
        return (
            <div>
                {
                    this.state.addPaymentMethodModalOpen &&
                        <AddPaymentMethodModal
                            isOpen={true}
                            closeModal={() => this.setAddPaymentMethodModalVisibility(false)}
                            authority={this.props.authority}
                            paymentEnvironment={this.state.env}
                            bypassDwolla={this.props.bypassDwolla}
                            onPaymentMethodAdded={this.onPaymentMethodAdded}
                            disablePaymentMethod={this.props.disablePaymentMethod}
                        />
                }
                <div className="ss-button-primary cursor-pointer"
                     onClick={() => this.setAddPaymentMethodModalVisibility(true)}>
                    Add Payment Method
                </div>
            </div>
        )
    }
}
