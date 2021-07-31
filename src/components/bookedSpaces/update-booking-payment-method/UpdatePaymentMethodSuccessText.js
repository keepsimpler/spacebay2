import React, { Component } from 'react'

export default class UpdatePaymentMethodSuccessText extends Component {
    render() {
        return (
            <div>
                The payment method for this booking was updated successfully.
                <br />
                <br />
                Any future charges to this booking will use this payment method and include any associated payment
                processor fees.
            </div>
        )
    }
}
