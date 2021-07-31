import React from 'react';
import '../css/components/error.css'

function ErrorAlert(props) {
    return (
        <div className="ss-danger-box ss-large center-block">{props.children}</div>
    );
}

export default ErrorAlert;