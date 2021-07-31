import React, {Component} from 'react';

const $ = window.$;

class DatePicker extends Component {

    componentDidMount() {
        this.initDatePickers();
    }

    initDatePickers = () => {
        $('#' + this.props.id).datepicker({format: 'm/d/yyyy'}).on('changeDate', this.props.onChange);
    };

    render() {
        let width = this.props.width ? this.props.width : "75px";
        return (
            <input type="text"
                   className={this.props.inputClassNames}
                   style={{display: "inline", width: width, marginRight: "0"}}
                   data-date-autoclose="true"
                   id={this.props.id}
                   name={this.props.name}
                   value={this.props.value}
                   onChange={this.props.onChange}
                   placeholder="MM/DD/YYYY"
                   readOnly
            />
        )
    }
}

export default DatePicker;