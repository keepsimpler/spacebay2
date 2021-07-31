import React, { Component } from 'react'
import { VerificationType } from "../../constants/securspace-constants";
import classNames from 'classnames'
import PropTypes from 'prop-types'

export default class PayWithACH extends Component {

    static propTypes = {
        verificationType: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    }

    render() {

        const { verificationType, onChange } = this.props

        return (
            <div className={this.props.containerClassName}>
                <h4 className="add-payment-method-select-type-header">Select Bank Account Verify Method</h4>
                <div className="add-payment-method-pill-group">
                    <div
                        onClick={() => onChange(VerificationType.INSTANT) }
                        className={classNames("add-payment-method-pill", { "active": verificationType === VerificationType.INSTANT})}
                    >
                        Instant
                    </div>
                    <div
                        onClick={() => onChange(VerificationType.MICRO_DEPOSIT)}
                        className={classNames("add-payment-method-pill", { "active": verificationType === VerificationType.MICRO_DEPOSIT})}
                    >
                        Micro Deposit
                    </div>
                </div>
                <div className="pay-with-ach-details-container">
                    <p className="ss-details">
                        <b>Instant</b>
                        <br/>
                        &nbsp;&bull;&nbsp;&nbsp;Requires you to enter your Online Banking credentials
                        <br/>
                        &nbsp;&bull;&nbsp;&nbsp;Not supported with some local banks
                        <br/>
                        <b>Micro Deposit</b>
                        <br/>
                        &nbsp;&bull;&nbsp;&nbsp;Requires you to enter your bank account info
                        <br/>
                        &nbsp;&bull;&nbsp;&nbsp;Takes a few days to complete
                        <br/>
                        &nbsp;&bull;&nbsp;&nbsp;Supported with all banks
                    </p>
                </div>
            </div>
        )
    }
}
