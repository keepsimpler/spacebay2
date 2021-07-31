import React, { useEffect, useContext } from 'react'
import { useHistory } from "react-router";
import { requestLogout } from "../services/session/session-requests";
import { AppContext } from "../context/app-context";
import { toast } from "react-toastify";

const Logout = () => {
    const appContext = useContext(AppContext)
    const { user, updateUser, loadingUserDetails } = appContext

    const history = useHistory()

    useEffect(() => {
        if(user && user.id) {
            requestLogout()
                .then(() => {
                    toast.success("Logged Out")
                    updateUser(null, history)
                })
                .catch(() => history.push("/login?loggedOut=true"))
        } else if(!loadingUserDetails) {
            history.push("/")
        }
    }, [loadingUserDetails, history, updateUser, user])

    return <div/>
}

export default Logout
