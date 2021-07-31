import React from 'react';
import '../css/components/badge.css'

function getStatusClass(status) {
    if (status === 'Approved' || status === 'Approved-Adjusted' || status === 'Active' || status === 'Active-Adjusted' ||
        status === 'Completed' || status === 'Completed-Adjusted') {
        return 'ss-small ss-success-box';
    } else if (status === 'Processing-ACH-Payment' || status === 'Processing-ACH-Payment-Adjusted' ||
        status === 'Processing-ACH-Refund-Adjusted' || status === 'Pending') {
        return 'ss-small ss-warning-box';
    } else {
        return 'ss-small ss-danger-box';
    }
}

function StatusBadge(props) {
    return (
        <div className={getStatusClass(props.children)}>{props.children}</div>
    );
}

export default StatusBadge;