import React from 'react'
import { ToastContainer } from "react-toastify";

const ToastContainerWrapper = () => {
    return (
        <ToastContainer
            className="ss-toast-container"
            toastClassName="ss-toast"
            position="top-center"
            autoClose={10000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            draggable
            pauseOnHover
        />
    )
}

export default ToastContainerWrapper
