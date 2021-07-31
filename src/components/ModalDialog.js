import React from 'react';
import '../css/components/ssDialog.css';

export default ({dialogClass, handleCloseEvent, title, subtitle, children}) => (
    <div className={title ? 'hs-bookings-container' : 'ss-modal-background'}>
        {
            title ?
                <div className={dialogClass}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="popup-header">
                                <div>
                                    <h1>{title}</h1>
                                    {subtitle ?
                                        <h4 className="blue-txt">{subtitle}</h4>
                                        :
                                        null}
                                </div>
                                <button type="button" className="close pull-right"
                                        aria-label="Close"
                                        onClick={handleCloseEvent}>
                                    <img alt="" src="../app-images/close.png"/>
                                </button>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
                :
                <div className={"ss-dialog " + dialogClass}>
                    <img className="ss-modal-close-img" alt=""
                         src="../app-images/close.png"
                         onClick={handleCloseEvent}/>
                    {children}
                </div>
        }
    </div>
)

