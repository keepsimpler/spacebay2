import React, { useContext } from 'react'
import { useHistory } from "react-router";
import { AppContext } from "../../context/app-context";
import { UserType, AccountType } from "../constants/securspace-constants";
import { requestLogBackInAsAdmin } from "./request/admin-requests";
import { toast } from "react-toastify";

const LoggedInAsHeader = () => {
    const appContext = useContext(AppContext)
    const { user, updateUser } = appContext
    const { userType, type, companyName } = user || {}

    const history = useHistory()

    const handleBackToAdmin = () => {
        requestLogBackInAsAdmin()
            .then((resp) => updateUser(resp.body, history))
            .catch(handleError)
    }

    return userType === UserType.ADMIN && type !== AccountType.ADMIN ?
        <div className="logged-in-as-info w-100">
            <span className="logged-in-as-label">LOGGED IN AS:</span>
            {companyName}
            <button className="ss-button-secondary" onClick={handleBackToAdmin}>
                Back To Admin Account
            </button>
        </div>
        :
        null
}

const handleError = (err) => {
    let message = (err && err.message) ? err.message : 'Internal Server Error'
    toast.error(message)
}

export default LoggedInAsHeader
