import React, {Component} from 'react';
import classNames from "classnames";
import {validateContainerNumber} from "../util/ContainerValidator";
import OCREnabledField from "./checkin/component/OCREnabledField";
import {AppContext} from "../context/app-context";

class ContainerEntryField extends Component {

    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {
            containerNumber: this.props.initState ? this.props.initState : '',
            errorCondition: ''
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.initState !== this.props.initState) {
            this.setState({containerNumber: nextProps.initState});
        }
    }

    handleFieldChange = event => {
        this.setState({
            errorCondition: ''
        });
        if (this.props.handleEquipmentErrorCleared) {
            this.props.handleEquipmentErrorCleared();
        }

        let containerNumber = event.target.value.replace(/ /g, "");

        containerNumber = containerNumber ? containerNumber.toUpperCase() : containerNumber;

        if (containerNumber && !validateContainerNumber(containerNumber)) {
            let errorMessage = "Check Digit Error";
            this.setState({
                errorCondition: errorMessage
            });
            if (this.props.handleEquipmentError) {
                this.props.handleEquipmentError(errorMessage);
            }
        }

        this.setState({
            containerNumber: containerNumber
        });
        this.props.valueCallback(containerNumber);
    };

    render() {

        const {correlationId} = this.props;
        const appContext = this.context;
        const {user} = appContext;

        return (
            <div>
                <OCREnabledField className={classNames(this.props.classNames, this.props.className)}
                                 name="containerNumber"
                                 label="CONTAINER NUMBER"
                                 value={this.state.containerNumber}
                                 onChange={this.handleFieldChange}
                                 setText={(text) => {
                                     this.setState({containerNumber: text})
                                     this.props.valueCallback(text)
                                 }}
                                 placeholder="Enter a valid container number"
                                 isEnabled={user.rekognitionPrivileges}
                                 correlationId={correlationId}
                                 error={this.state.errorCondition}
                />
            </div>
        );
    }
}

export default ContainerEntryField;
