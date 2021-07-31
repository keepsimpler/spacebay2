import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { formatCurrencyValue, validateCurrencyValue, parseCurrencyValue } from "../../../util/PaymentUtils";

import 'css/modal-currency-field.css'

export default class ModalCurrencyField extends Component {

    static propTypes = {
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.number.isRequired
        ]),
        onChange: PropTypes.func.isRequired
    }

    handleChange = (event) => {
        const { onChange } = this.props

        let value = event.target.value

        if(!validateCurrencyValue(value)) {
            return
        }
        value = parseCurrencyValue(value)

        onChange(value)
    }

    render() {
        return (
            <div className={classNames("modal-currency-field", { [this.props.className]: this.props.className})}>
                <div className="modal-currency-label">{this.props.label}</div>
                <div className="modal-currency-input-container">
                    <input
                        {...this.props}
                        type="text"
                        value={formatCurrencyValue(this.props.value)}
                        onChange={this.handleChange}
                        className="modal-currency-input"
                    />
                </div>

            </div>
        )
    }

}
