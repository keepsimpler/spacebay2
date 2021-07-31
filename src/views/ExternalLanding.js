import React, {Component} from 'react';
import Iframe from "react-iframe";
// import '../css/views/externalLanding.css';

class ExternalLanding extends Component {

    render() {
        return (
            <Iframe url={this.props.url}
                    position="relative"
                    width="100%"
                    height={this.props.height}
                    className="ss-external-landing"
            />
        );
    }
}

export default ExternalLanding;