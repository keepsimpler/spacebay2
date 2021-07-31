import React, { Component } from 'react'
import PaymentMethodCard from "./PaymentMethodCard";
import { getErrorMessageForStandardResponse } from "../../../util/NetworkErrorUtil";
import { requestPaymentMethods } from "../request/payment-method-requests";
import Busy from "../../Busy";
import PropTypes from 'prop-types'

import 'css/display-payment-methods.css'

export default class DisplayPaymentMethods extends Component {

    static propTypes = {
        authorityId: PropTypes.string.isRequired,
        userType: PropTypes.string.isRequired,
        refreshPaymentMethodsHook: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            paymentMethods: [],
            errorMessage: null
        }

        const { refreshPaymentMethodsHook } = props

        if(refreshPaymentMethodsHook) {
            refreshPaymentMethodsHook(this.getPaymentMethods)
        }
    }

    componentDidMount() {
        const { authorityId } = this.props

        if(authorityId) {
            this.getPaymentMethods()
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps && this.props) {
            const { authorityId: prevAuthorityId } = prevProps
            const { authorityId } = this.props

            if(prevAuthorityId !== authorityId) {
                this.getPaymentMethods()
            }
        }
    }

    getPaymentMethods = () => {
        const { authorityId, userType } = this.props
        if(authorityId) {
            this.setState({paymentMethods: []})

            Busy.set(true)

            requestPaymentMethods(
                authorityId,
                userType,
                paymentMethods => {
                    Busy.set(false)
                    this.setState({paymentMethods})
                },
                err => {
                    Busy.set(false)
                    this.setState({errorMessage: getErrorMessageForStandardResponse(err)})
                }
            )
        }
    }

    render() {

        const { authorityId, userType } = this.props

        return (
            this.state.paymentMethods.length > 0 ?
                <div>
                    {
                        this.state.paymentMethods.map((method, i) => {
                            return <PaymentMethodCard
                                key={i}
                                authorityId={authorityId}
                                userType={userType}
                                paymentMethod={method}
                                onPaymentMethodModified={this.getPaymentMethods}
                            />
                        })
                    }
                </div> : (
                    <div className="no-payment-methods-found-container">
                            <div className="no-payment-methods-found-message">No Payment Methods Found</div>
                    </div>
                )
        )
    }
}
