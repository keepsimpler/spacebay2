import React, { Component } from 'react'
import DisplayPaymentMethods from "../paymentMethods/displayPaymentMethod/DisplayPaymentMethods";
import AddPaymentMethod from "../paymentMethods/addPaymentMethod/AddPaymentMethod";
import PropTypes from 'prop-types'
import {PaymentType} from "../constants/securspace-constants";

import 'css/third-party-payment-management.css'

export default class ThirdPartyPaymentManagement extends Component {

    static propTypes = {
        authority: PropTypes.shape({
            authorityId: PropTypes.string.isRequired,
            userType: PropTypes.string.isRequired,
            contactEmail: PropTypes.string.isRequired
        })
    }

    constructor(props) {
        super(props);

        this.state = {
            refreshDisplayedPaymentMethods: null
        }
    }

    setRefreshDisplayedPaymentMethods = (updateFn : () => void) => {
        this.setState({
            refreshDisplayedPaymentMethods: updateFn
        })
    }

    render() {
        const { authority } = this.props
        const { authorityId, userType } = authority || {}
        return (
            <div>
                <DisplayPaymentMethods
                    authorityId={authorityId}
                    userType={userType}
                    refreshPaymentMethodsHook={this.setRefreshDisplayedPaymentMethods}
                />
                {
                    this.state.refreshDisplayedPaymentMethods &&
                    <div className="add-payment-method-btn-container">
                        <AddPaymentMethod
                            authority={authority}
                            onPaymentMethodAdded={this.state.refreshDisplayedPaymentMethods}
                            bypassDwolla={true}
                            disablePaymentMethod={PaymentType.CARD}
                        />
                    </div>
                }
            </div>
        )
    }
}
