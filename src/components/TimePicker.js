import React, {Component} from 'react';

const isInteger = (x) => {
    return x && (Number.isInteger(x) || x.indexOf('.') < 0) && x % 1 === 0;
};

class TimePicker extends Component {

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
        return {
            hour: value ? value.split(':')[0] : '',
            minute: value ? value.split(':')[1] : ''
        }
    }

    onChange = (event) => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if (!isInteger(value) || value > 9999999999) {
            return;
        }

        if ('hour' === name && value > 23) {
            return;
        }
        if ('minute' === name && value > 59) {
            return;
        }

        if (value.length < 1) {
            value = '00';
        } else if (value.length < 2) {
            value = '0' + value;
        } else if (value.length > 2) {
            value = value.substring(value.length - 2, value.length);
        }

        this.setState({[name]: value}, () => {
            this.props.onChange({
                target: {
                    name: this.props.name,
                    value: this.state.hour + ':' + this.state.minute,
                    type: 'text'
                }
            });
        });
    };

    render() {
        return (
            <div style={{display: "inline"}}>
                <input type="text"
                       className={this.props.inputClassNames}
                       style={{display: "inline", width: "20px", margin: "0 5px 0 10px"}}
                       id={this.props.id + "-hour"}
                       name="hour"
                       value={this.state.hour}
                       onChange={this.onChange}
                       placeholder="HH"
                />:
                <input type="text"
                       className={this.props.inputClassNames}
                       style={{display: "inline", width: "20px", margin: "0 5px 0 10px"}}
                       id={this.props.id + "-minute"}
                       name="minute"
                       value={this.state.minute}
                       onChange={this.onChange}
                       placeholder="mm"
                />
            </div>
        )
    }
}

export default TimePicker;
