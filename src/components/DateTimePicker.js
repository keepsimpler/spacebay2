import React, {Component} from 'react';
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";

const forceTwoDigits = (number) => {
    return number.toString().padStart(2, '0');
};

class DateTimePicker extends Component {

    constructor(props) {
        super(props);

        this.state = this.initState(this.props.value);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState(this.initState(nextProps.value))
        }
    }

    initState(value) {
        let dateTime = value ? new Date(value) : '';
        let datePart = dateTime ? `${forceTwoDigits(dateTime.getMonth() + 1)}/${forceTwoDigits(dateTime.getDate())}/${dateTime.getFullYear()}` : '';
        let timePart = dateTime ? `${forceTwoDigits(dateTime.getHours())}:${forceTwoDigits(dateTime.getMinutes())}` : '';

        return {
            date: datePart,
            time: timePart
        }
    }

    onChange = (event) => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        this.setState({[name]: value}, () => {
            this.props.onChange({
                target: {
                    name: this.props.name,
                    value: new Date(this.state.date + ' ' + this.state.time),
                    type: 'text'
                }
            });
        });
    };

    render() {
        return (
            <div>
                <DatePicker inputClassNames={this.props.inputClassNames}
                            id={this.props.id + "-date"}
                            name="date"
                            value={this.state.date}
                            onChange={this.onChange}
                />
                <TimePicker inputClassNames={this.props.inputClassNames}
                            id={this.props.id + "-time"}
                            name="time"
                            value={this.state.time}
                            onChange={this.onChange}/>
            </div>
        )
    }
}

export default DateTimePicker;
