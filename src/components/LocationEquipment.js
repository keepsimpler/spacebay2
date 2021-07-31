import React, {Component} from 'react';
import 'react-router-modal/css/react-router-modal.css';
import '../css/components/alert.css';
import {
    formatCurrencyValue,
    getPricePerDayFromMonthlyRate, getPricePerDayFromWeeklyRate,
    parseCurrencyValue,
    validateCurrencyValue
} from "../util/PaymentUtils";
import Error from "./Error";


class LocationEquipment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            equipmentTypes: this.props.equipmentTypes ? this.props.equipmentTypes : null,
            errorMessage: this.props.errorMessage ? this.props.errorMessage : null,
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({
            currentEquipment: this.props.currentEquipment ? this.props.currentEquipment : null,
            equipmentTypes: this.props.equipmentTypes ? this.props.equipmentTypes : null,
            errorMessage: this.props.errorMessage ? this.props.errorMessage : null
        })
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.currentEquipment) {
            this.setState({currentEquipment: newProps.currentEquipment});
        }
        if (newProps.equipmentTypes) {
            this.setState({equipmentTypes: newProps.equipmentTypes});
        }
        if (typeof newProps.errorMessage !== 'undefined') {
            this.setState({errorMessage: newProps.errorMessage});
        }
    }


    handleChange = event => {
        let name = event.target.name;

        let value = (event.target.type === 'checkbox' ) ? event.target.checked : event.target.value;
        if (event.target.type === 'radio') {
            value = (value === "0") ? false : true;
        }
        if ('pricePerDay' === name || 'pricePerWeek' === name || 'pricePerMonth' === name) {
            if (!validateCurrencyValue(value)) {
                return;
            }
            value = parseCurrencyValue(value);
        }
        let newEq = this.state.currentEquipment;
        newEq[name] = value;

        this.setState({currentEquipment: newEq});
        this.props.currentEquipmentChanged(newEq);
    };

    render() {
        return (
            <div style={{height: "250px"}}>
                <p className="up-margin">Select which equipment type and add pricing</p>
                {this.state.equipmentTypes ?
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label style={{marginBottom: "5px"}} className="col-sm-12">Equipment Type</label>
                            <div className="col-sm-12">

                                <select name="equipmentType" className="form-control"
                                        placeholder="Select Equipment Type"
                                        onChange={this.handleChange}
                                >
                                    {Object.keys(this.state.equipmentTypes).map((key, index) =>
                                        !this.state.equipmentTypes[key].value ?
                                            <option value={this.state.equipmentTypes[key].label} key={key}>
                                                {this.state.equipmentTypes[key].label}
                                            </option>
                                            :
                                            (this.state.equipmentTypes[key].label === this.state.currentEquipment.equipmentType ?
                                                    <option value={this.state.equipmentTypes[key].label} key={key}
                                                            selected>
                                                        {this.state.equipmentTypes[key].label}
                                                    </option>
                                                    :
                                                    ''
                                            )
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-12">Price</label>
                            <div className="col-sm-6">
                                <label className="ss-checkbox">
                                    <input type="radio"
                                           className="ss-book-space-radio-input"
                                           name="customPrice"
                                           checked={!this.state.currentEquipment.customPrice}
                                           value="0"
                                           onChange={this.handleChange}
                                    />Use default pricing
                                </label>
                            </div>
                            <div className="col-sm-6">
                                <label className="ss-checkbox">
                                    <input type="radio"
                                           className="ss-book-space-radio-input"
                                           name="customPrice"
                                           checked={this.state.currentEquipment.customPrice}
                                           value="1"
                                           onChange={this.handleChange}
                                    />Use custom pricing
                                </label>
                            </div>
                        </div>

                        {
                            this.state.currentEquipment.customPrice ?
                                <div className="form-group">
                                    <div className="col-sm-12 prices-box">
                                        <div className="col-sm-4">
                                            <div>
                                                <p>Price per day</p>
                                                <input type="text"
                                                       name="pricePerDay"
                                                       value={formatCurrencyValue(this.state.currentEquipment.pricePerDay) || ''}
                                                       onChange={this.handleChange}
                                                       maxLength={10} autoComplete="off"
                                                />
                                            </div>
                                        </div>
                                        {this.props.account.userType === 'ADMIN' ?
                                            <div className="col-sm-4">
                                                <div>
                                                    <p>Price per week</p>
                                                    <input type="text"
                                                           name="pricePerWeek"
                                                           value={formatCurrencyValue(this.state.currentEquipment.pricePerWeek) || ''}
                                                           onChange={this.handleChange}
                                                           maxLength={10} autoComplete="off"
                                                    />
                                                </div>
                                                <div className="calculated-field">
                                                    {this.state.currentEquipment.pricePerWeek ?
                                                        "($" + getPricePerDayFromWeeklyRate(this.state.currentEquipment.pricePerWeek) + " per day)" : ""}</div>

                                            </div>
                                            : null}
                                        <div className="col-sm-4">
                                            <div>
                                                <p>Price per month</p>
                                                <input type="text"
                                                       name="pricePerMonth"
                                                       value={formatCurrencyValue(this.state.currentEquipment.pricePerMonth) || ''}
                                                       onChange={this.handleChange}
                                                       maxLength={10} autoComplete="off"
                                                />
                                            </div>
                                            <div className="calculated-field">
                                                {this.state.currentEquipment.pricePerMonth ? "($" + getPricePerDayFromMonthlyRate(this.state.currentEquipment.pricePerMonth) + " per day)" : ""}</div>

                                        </div>
                                    </div>
                                </div>
                                :
                                <div className="form-group">
                                    <div className="col-sm-12 prices-box">
                                        <div className="col-sm-4">
                                            <div>
                                                <p>Price per day</p>
                                                <input type="text"
                                                       name="pricePerDay"
                                                       readOnly
                                                       disabled
                                                       value={this.props.location ? formatCurrencyValue(this.props.location.pricePerDay) : ''}
                                                />
                                            </div>
                                        </div>
                                        {this.props.account.userType === 'ADMIN' ?
                                            <div className="col-sm-4">
                                                <div>
                                                    <p>Price per week</p>
                                                    <input type="text"
                                                           name="pricePerWeek"
                                                           value={this.props.location ? formatCurrencyValue(this.props.location.pricePerWeek) : ''}
                                                           readOnly
                                                           disabled
                                                    />
                                                </div>
                                                <div className="calculated-field disabled">
                                                    {(this.props.location && this.props.location.pricePerWeek) ? "($" + getPricePerDayFromWeeklyRate(this.props.location.pricePerWeek) + " per day)" : ""}</div>

                                            </div>
                                            : null}
                                        <div className="col-sm-4">
                                            <div>
                                                <p>Price per month</p>
                                                <input type="text"
                                                       name="pricePerMonth"
                                                       value={this.props.location ? formatCurrencyValue(this.props.location.pricePerMonth) : ''}
                                                       readOnly
                                                       disabled
                                                />
                                            </div>
                                            <div className="calculated-field disabled">
                                                {(this.props.location && this.props.location.pricePerMonth) ? "($" + getPricePerDayFromMonthlyRate(this.props.location.pricePerMonth) + " per day)" : ""}</div>

                                        </div>
                                    </div>
                                </div>
                        }
                    </form>
                    : ''
                }
                <div style={{marginTop: "25px", marginLeft: "-15px"}}>
                    <Error>{this.state.errorMessage}</Error>
                </div>
            </div>
        )
    }
}

export default LocationEquipment;

