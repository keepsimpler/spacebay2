import React from 'react';
import '../css/components/error.css'

function Error(props) {
    return (
        <div className="ss-error">{props.children}</div>
    );
}

export default Error;