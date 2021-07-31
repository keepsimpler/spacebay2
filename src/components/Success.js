import React from 'react';
import '../css/components/success.css'

function Success(props) {
    return (
        <div className="ss-success">{props.children}</div>
    );
}

export default Success;