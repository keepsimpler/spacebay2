import React from 'react';
import "css/components/accountTypeSelector.css"


export default ({type, stateHook}) => (
    <div id="signup-account-type-bubble">
        <div className={type === 'Buyer' ? 'signup-account-type-base signup-account-type-selected' : 'signup-account-type-base'} onClick={() => stateHook('Buyer')}>
            Customer
        </div>
        <div className={type === 'Supplier' ? 'signup-account-type-base signup-account-type-selected' : 'signup-account-type-base'} onClick={() => stateHook('Supplier')}>
            Partner
        </div>
    </div>

);
