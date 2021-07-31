import React from 'react';
import "../css/components/checkBox.css"

export default ({children, checked = false, onCheck}) => (
    <div className="ss-checkbox-container">
        <div>
            <input type="checkbox"
                   className="ss-checkbox-container-checkbox"
                   value={checked}
                   onChange={(event) => onCheck(event.target.checked)}
            />
        </div>
        <div>
            {children}
        </div>
    </div>
)