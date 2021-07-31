import "bootstrap3/dist/css/bootstrap.css";
import "fontawesome-4.7/css/font-awesome.min.css";
import "./css/bootstrap-datepicker3.min.css";
import "./css/react-router-modal.css";
import "./css/App.css";
import "./css/index.css";
import "./css/ReactToastify.min.css";
import React, { Component } from "react";
import { AppContext } from "./context/app-context";
import TrackJsInitializer from "./services/TrackJsInitializer";
import SessionPoller from "./services/session/SessionPoller";
import SecurSpaceRouter from "./routing/SecurSpaceRouter";
import { requestLoggedInAuthoritySource } from "./services/session/session-requests";
import { getLandingRedirectPathForUser } from "./routing/route-utils";
import Busy from "./components/Busy";

export default class SecurSpaceApp extends Component {
    constructor(props) {
        super(props);

        TrackJsInitializer.initialize();

        this.state = {
            user: null,
            loadingUserDetails: true,
        };
    }

    componentDidMount() {
        if (!this.state.user || !this.state.user.username) {
            Busy.set(true);
            requestLoggedInAuthoritySource()
                .then((resp) => this.handleAlreadyLoggedIn(resp.body))
                .catch((err) => this.handleReloadFailure(err));
        } else {
            this.setState({ loadingUserDetails: false });
        }
    }

    componentWillUnmount() {
        SessionPoller.cancelPolling();
    }

    handleAlreadyLoggedIn = (account) => {
        this.setState({
            user: account,
            loadingUserDetails: false,
        });
        TrackJsInitializer.updateUserInfo(account);
        SessionPoller.beginPolling(this.handlePollingFail);
        Busy.set(false);
    };

    handleReloadFailure = () => {
        this.setState({ loadingUserDetails: false });
        Busy.set(false);
    };

    updateUser = (user, history?: { push: (path: String) => void }) => {
        this.setState({ user });
        TrackJsInitializer.updateUserInfo(user);

        if (!user) {
            SessionPoller.cancelPolling();
        }

        if (history) {
            history.push(getLandingRedirectPathForUser(user));
        }
    };

    handlePollingFail = () => {
        this.clearUser();
        /*
            It's not worth re-rendering the entire tree every time
            the url changes to provide react router's history object
            here, so we are just going to do redirect the old fashioned
            way
         */
        window.location.href = "/login?timeout=true";
    };

    clearUser = () => {
        this.setState({ user: undefined });
        TrackJsInitializer.updateUserInfo(null);
        SessionPoller.cancelPolling();
    };

    logout = () => {
        window.location.href = "/logout";
    };

    generateAppContext = () => {
        return {
            user: this.state.user,
            loadingUserDetails: this.state.loadingUserDetails,
            updateUser: this.updateUser,
            clearUser: this.clearUser,
            logout: this.logout,
        };
    };

    render() {
        return (
            <AppContext.Provider value={this.generateAppContext()}>
                <SecurSpaceRouter />
            </AppContext.Provider>
        );
    }
}
