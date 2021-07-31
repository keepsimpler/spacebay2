import React, {Component} from 'react';

class Badge extends Component {
    render() {
        return (
            <span className={this.props.pendingBookings> 0 ? "badge badge-alert "+this.props.type : "hidden"}>
                {this.props.pendingBookings > 0 ? this.props.pendingBookings : ''}
                </span>
        )
    }
}

export default Badge;
