import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _ from 'underscore'

import 'css/modal-select-field.css'

export default class ModalSelectField extends Component {

    static propTypes = {
        label: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        className: PropTypes.string,
        handleChange: PropTypes.func.isRequired,
        selectedOption: PropTypes.object.isRequired,
        placeholder: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        }))
    }

    constructor(props) {
        super(props);

        this.state = {
            showOptions: false
        }
    }


    setOptionsVisible = (visible: boolean) => {
        this.setState({ showOptions: visible})
    }

    updateValue = (value) => {
        const { handleChange } = this.props
        this.setOptionsVisible(false)
        handleChange(value)
    }

    render() {

        const {
            label,
            className,
            options,
            placeholder,
            selectedOption
        } = this.props

        return (
            <div className="partner-details-field add-payment-method-select-container">
                <label className="partner-details-field-label add-payment-method-select-label">
                    {label}
                </label>
                <input type="text"
                       value={selectedOption.label || ""}
                       className={classNames("partner-details-field-input add-payment-method-select-input", { className })}
                       readOnly={true}
                       placeholder={placeholder}
                       onClick={() => this.setOptionsVisible(true)}
                />
                {
                    this.state.showOptions &&
                    <div className="add-payment-method-select-options-list-container">
                        <ul>
                            {
                                _.map(options, (option, idx) => {
                                    return (
                                        <li key={idx} onClick={() => this.updateValue(option.value)} className="add-payment-method-select-option">
                                            {option.label}
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                }

            </div>

        )
    }
}
