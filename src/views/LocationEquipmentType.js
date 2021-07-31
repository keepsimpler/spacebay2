import React, {Component} from 'react';
import 'react-router-modal/css/react-router-modal.css';
import '../css/components/alert.css';
import ConfirmDialog from "../components/ConfirmDialog";
import ModalForm from "../components/ModalForm";
import LocationEquipment from "../components/LocationEquipment";
import {formatCurrencyValue} from "../util/PaymentUtils";


class LocationEquipmentType extends Component {
    constructor(props) {
        super(props);
        let emptyEquipment = {
            id: null,
            pricePerDay: null,
            pricePerWeek: null,
            pricePerMonth: null,
            equipmentType: null,
            replacedType: null,
            customPrice: false
        }
        this.state = {
            showAlert: false,
            showForm: false,
            errorMessage: null,
            locationEqIndex: null,
            action: null,
            locationEquipmentTypes: this.props.locationEquipmentTypes ? this.props.locationEquipmentTypes : null,
            location: this.props.location ? this.props.location : {pricePerDay: 0, pricePerWeek: 0, pricePerMonth: 0},
            equipmentTypes: this.props.equipmentTypes ? this.props.equipmentTypes : null,
            currentEquipment: emptyEquipment
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({
            locationEquipmentTypes: this.props.locationEquipmentTypes ? this.props.locationEquipmentTypes : null,
            location: this.props.location ? this.props.location : null,
            equipmentTypes: this.props.equipmentTypes ? this.props.equipmentTypes : null
        })
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (newProps.locationEquipmentTypes) {
            let temp = newProps.locationEquipmentTypes;
            temp = this.sortLocationEquipmentTypes(temp);
            this.setState({locationEquipmentTypes: temp});
        }
        if (newProps.equipmentTypes) {
            this.setState({equipmentTypes: newProps.equipmentTypes});
        }
        if (newProps.location) {
            this.setState({location: newProps.location});
        }

    }

    sortLocationEquipmentTypes(temp) {
        temp.sort((a, b) => {
            var nameA = a.equipmentType.toLowerCase(), nameB = b.equipmentType.toLowerCase();
            if (nameA < nameB) //sort string ascending
                return -1
            if (nameA > nameB)
                return 1
            return 0;
        });
        return temp;
    }

    addNewEquipment = () => {
        this.setState({action: 'add'});
        let emptyEquipment = {
            id: null,
            pricePerDay: null,
            pricePerWeek: null,
            pricePerMonth: null,
            equipmentType: null,
            replacedType: null,
            customPrice: false
        }
        let remainingTypes = false;
        Object.keys(this.state.equipmentTypes).forEach((key, index) => {
            if (!this.state.equipmentTypes[key].value && !remainingTypes) {
                emptyEquipment.equipmentType = this.state.equipmentTypes[key].label;
                remainingTypes = true;
            }
        });
        if (!remainingTypes) {
            alert('You\'ve added all  equipment types, none available!');
            return;
        }

        this.setState({currentEquipment: emptyEquipment, showForm: true, errorMessage: ''});
    };

    editEquipment = index => {
        this.setState({action: 'edit'});
        let emptyEquipment = JSON.parse(JSON.stringify(this.state.locationEquipmentTypes[index]));
        emptyEquipment.replacedType = emptyEquipment.equipmentType;
        emptyEquipment.customPrice = (emptyEquipment.pricePerDay || emptyEquipment.pricePerMonth) ? true : false;
        this.setState({currentEquipment: emptyEquipment, showForm: true, errorMessage: ''});
    };

    deleteAccountConfirm = index => {
        this.setState({showAlert: true, locationEqIndex: index});
    };

    deleteEquipmentTypeChangeByLocationEquipmentTypes = () => {
        for (let name in this.state.equipmentTypes) {
            if (this.state.equipmentTypes[name].label === this.state.locationEquipmentTypes[this.state.locationEqIndex].equipmentType) {
                let temp = this.state.equipmentTypes;
                temp[name].value = false;
                this.setState({equipmentTypes: temp});
                break;
            }
        }
        //delete from locationEquipmentTypes
        this.state.locationEquipmentTypes.splice(this.state.locationEqIndex, 1);
        this.setState({locationEqIndex: null});
    };

    currentEquipmentChanged = updatedEquipment => {
        let errorMessage = '';

        if (updatedEquipment.customPrice && !updatedEquipment.pricePerDay && !updatedEquipment.pricePerMonth) {
            errorMessage = "Please set a Daily or Monthly price";
        }

        this.setState({
            currentEquipment: updatedEquipment,
            errorMessage: errorMessage
        });
    };

    saveEditAction = () => {
        let tempEq = this.state.locationEquipmentTypes;

        for (let item in tempEq) {
            //replace old item with the edit values
            if (tempEq[item].equipmentType === this.state.currentEquipment.replacedType) {
                tempEq[item] = this.state.currentEquipment;
                if (!this.state.currentEquipment.customPrice) {
                    tempEq[item].pricePerDay = null;
                    tempEq[item].pricePerWeek = null;
                    tempEq[item].pricePerMonth = null;
                }
                break;
            }
        }

        if (this.state.currentEquipment.replacedType) {
            //delete from equipmentTypes the old eq
            for (let name in this.state.equipmentTypes) {
                if (this.state.equipmentTypes[name].label === this.state.currentEquipment.replacedType) {
                    let temp = this.state.equipmentTypes;
                    temp[name].value = false;
                    this.setState({equipmentTypes: temp});
                }
                if (this.state.equipmentTypes[name].label === this.state.currentEquipment.equipmentType) {
                    let temp = this.state.equipmentTypes;
                    temp[name].value = true;
                    this.setState({equipmentTypes: temp});
                }
            }
        }

        this.props.updateLocationEquipmentTypes(tempEq);//update LocationEquipmentTypes from parent
    };

    saveAddAction = () => {
        let tempEq = this.state.locationEquipmentTypes;
        tempEq.push(this.state.currentEquipment);

        for (let name in this.state.equipmentTypes) {
            if (this.state.equipmentTypes[name].label === this.state.currentEquipment.equipmentType) {
                let temp = this.state.equipmentTypes;
                temp[name].value = true;
                this.setState({equipmentTypes: temp});
                break;
            }
        }

        this.props.updateLocationEquipmentTypes(tempEq);//update LocationEquipmentTypes from parent
    };

    saveLocationEquipmentTypes = () => {
        if (this.state.errorMessage) return;

        switch (this.state.action) {
            case 'add':
                this.saveAddAction();
                break;
            case 'edit':
                this.saveEditAction();
                break;
            default:
                //nothing
                break;
        }
        this.setState({action: null, currentEquipment: null});
    };

    render() {
        let _this = this;
        return (
            <div className="w100 location-items-column">
                <ConfirmDialog showAlert={this.state.showAlert}
                               title="Delete Equipment Type"
                               onClose={() => _this.setState({showAlert: false, locationEqIndex: null})}
                               proceedEventHandler={_this.deleteEquipmentTypeChangeByLocationEquipmentTypes}>
                    Are you sure to delete this equipment type?
                </ConfirmDialog>

                <ModalForm showForm={this.state.showForm}
                           title={this.state.action === "add" ? "Add Equipment Type" : "Edit Equipment Type"}
                           onClose={() => _this.setState({showForm: false, locationEqIndex: null})}
                           proceedEventHandler={this.saveLocationEquipmentTypes}
                           errorMessage={this.state.errorMessage}
                           currentEquipment={this.state.currentEquipment}>
                    <LocationEquipment currentEquipment={this.state.currentEquipment}
                                       errorMessage={this.state.errorMessage}
                                       currentEquipmentChanged={this.currentEquipmentChanged}
                                       location={this.props.location}
                                       account={this.props.account}
                                       equipmentTypes={this.state.equipmentTypes}/>
                </ModalForm>

                <p className="relative">
                    Select which equipment type you accept in this location.
                </p>
                <table className="table table-striped create-location">
                    <thead>
                    <tr>
                        <th>Equipment Type</th>
                        <th>Price per day</th>
                        {this.props.account.userType === 'ADMIN' ?
                            <th>Price per week</th>
                            : null
                        }
                        <th>Price per month</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    {
                        (_this.state.locationEquipmentTypes && _this.state.locationEquipmentTypes.length > 0) ?

                            <tbody>
                            {
                                _this.state.locationEquipmentTypes.map((locationEquipmentTypes, index) =>
                                    <tr key={"tr" + index.toString()}>
                                        <td>{locationEquipmentTypes.equipmentType}</td>
                                        <td>{
                                            locationEquipmentTypes.pricePerDay ?
                                                formatCurrencyValue(locationEquipmentTypes.pricePerDay)
                                                :
                                                formatCurrencyValue(_this.state.location ? _this.state.location.pricePerDay : 0)
                                        }</td>
                                        {this.props.account.userType === 'ADMIN' ?
                                            <td>{
                                                locationEquipmentTypes.pricePerWeek ?
                                                    formatCurrencyValue(locationEquipmentTypes.pricePerWeek)
                                                    :
                                                    formatCurrencyValue(_this.state.location ? _this.state.location.pricePerWeek : 0)
                                            }</td>
                                            : null}
                                        <td>{
                                            locationEquipmentTypes.pricePerMonth ?
                                                formatCurrencyValue(locationEquipmentTypes.pricePerMonth)
                                                :
                                                formatCurrencyValue(_this.state.location ? _this.state.location.pricePerMonth : 0)
                                        }</td>
                                        <td><i
                                            onClick={() => _this.editEquipment(index)}
                                            style={{cursor: "pointer"}}
                                            className="fa fa-pencil"></i></td>
                                        <td>
                                            <i name={locationEquipmentTypes.equipmentType}
                                               onClick={() => _this.deleteAccountConfirm(index)}
                                               style={{cursor: "pointer"}}
                                               className="fa fa-trash"></i>
                                        </td>
                                    </tr>
                                )
                            }
                            </tbody>
                            : null
                    }
                </table>
                <div className="w100 pull-left text-center">
                    <button type="button" className="ss-button-primary reverse"
                            onClick={this.addNewEquipment}>Add Equipment
                    </button>
                </div>
            </div>
        )
    }
}


export default LocationEquipmentType;
