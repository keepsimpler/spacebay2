import React, {Component} from 'react';
import '../css/components/dateArrow.css';
import classNames from 'classnames'

class DateArrow extends Component {

    constructor (props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={classNames("ss-date-arrow", this.props.className)}>
                <div className="arrow-top-half"/>
                <div className="arrow-bottom-half"/>
            </div>
        )
    }
}

export default DateArrow;
