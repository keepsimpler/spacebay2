import React from 'react';
import 'css/components/actionButton.css';

export default ({label, onClick, overrideClass}) => (
    <div className={'orange-button ss-action-button'}  onClick={onClick} >
        {label}
    </div>
)