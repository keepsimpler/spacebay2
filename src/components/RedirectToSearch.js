import React, {Component} from 'react';
import {Redirect} from "react-router-dom";

class RedirectToSearch extends Component {

    render() {
        return (
            <div>
                {
                    this.props.navToSearch ? <Redirect to='/search'/> : ''
                }
            </div>
        )
    }
}

export default RedirectToSearch;