import React, {Component} from 'react';
import '../css/components/busy.css'

const $ = window.$;

class Busy extends Component {

    static set(value) {
        if (value) {
            $(".busy-screen").removeClass("not-visible");
        } else {
            $(".busy-screen").addClass("not-visible");
        }
    }

    render()
    {
        return (
            <div className="busy-screen">
                <div data-spinner-bar="" className="busy-spinner-container">
                    <i className="fa fa-repeat busy-spinner" />
                </div>
            </div>
        );
    }
}

export default Busy;
