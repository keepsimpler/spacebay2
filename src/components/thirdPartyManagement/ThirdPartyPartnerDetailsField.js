import React, { Component } from 'react'

import 'css/third-party-partner-details-field.css'

export default class ThirdPartyPartnerDetailsField extends Component{
    render() {
        return (
            <div className="partner-details-field">
                <div className="partner-details-field-label">
                    {this.props.label}
                </div>
                <div className="partner-details-field-input-container">

                    {
                        this.props.disabled &&
                        <div className="partner-details-field-input decreased-opacity">
                            {this.props.value}
                        </div>
                    }

                    {
                        !this.props.disabled &&
                        <input
                            className="partner-details-field-input"
                            type="text"
                            value={this.props.value}
                            {...this.props}
                        />
                    }

                </div>
            </div>
        )
    }
}
