import React from 'react';
import Modal from "react-router-modal/lib/modal";
import '../css/components/confirmDeleteAccount.css';
import ActionButton from "./ActionButton";


export default ({closeEventHandler, account, proceedEventHandler,message,type}) => (
    <Modal className="ss-confirm-account-delete-modal"
           inClassName="ss-confirm-account-delete-modal-in"
           outClassName="ss-confirm-account-delete-modal-out"
           backdropInClassName="ss-confirm-account-delete-modal-backdrop-in"
           backdropOutClassName="ss-confirm-account-delete-modal-backdrop-out"
           backdropClassName="ss-confirm-account-delete-modal-backdrop"
           onBackdropClick={closeEventHandler}>

       <div className='ss-confirm-account-delete-container'>
           <div className='ss-confirm-account-delete-warning-text'>
               {message}
           </div>

           <div>
               <span className='ss-confirm-account-delete-title'>Account:</span> <span className='ss-confirm-account-delete-value'>{account.id}</span>
           </div>
           <div>
               <span className='ss-confirm-account-delete-title'>Company Name:</span> <span className='ss-confirm-account-delete-value'> {account.companyName}</span>
           </div>
           <div className='ss-confirm-account-delete-button-container'>
               <ActionButton label={type} onClick={() => proceedEventHandler({account})} />
           </div>
           <div className='ss-confirm-account-delete-button-container'>
               <ActionButton label='CANCEL' onClick={closeEventHandler} />
           </div>
       </div>

    </Modal>
);