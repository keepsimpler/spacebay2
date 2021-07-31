import React from 'react';
import {Redirect} from "react-router-dom";

function RedirectToPage(props) {

    return (
        <div>
            {
                props.redirectNow ? <Redirect to={props.page}/> : ''
            }
        </div>
    );
}

export default RedirectToPage;