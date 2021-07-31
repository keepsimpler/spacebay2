import React, { useContext } from 'react'
import { AppContext } from "../context/app-context";
import { getLandingRedirectPathForUser } from "./route-utils";
import { Redirect } from "react-router";

const UserBasedLandingRedirect = () => {
    const appContext = useContext(AppContext)
    const { user } = appContext

    return (
        <Redirect to={getLandingRedirectPathForUser(user)} />
    )
}



export default UserBasedLandingRedirect
