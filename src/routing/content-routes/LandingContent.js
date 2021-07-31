import React from 'react'
import { Route } from "react-router";

import ContextualSearch from "../../components/search/ContextualSearch";
import About from "../../views/About";
import HowItWorks from "../../views/HowItWorks";
import Contact from "../../views/Contact";
import Blog from "../../views/Blog";
import Faq from "../../views/Faq";
import LandingPage from "../../views/LandingPage";
import ChangePassword from "../../views/ChangePassword";
import Landing from "../../views/Landing";
import BookingApproval from "../../views/BookingApproval";
import ExternalLanding from "../../views/ExternalLanding";
import UserBasedLandingRedirect from "../UserBasedLandingRedirect";
import Logout from "../../components/Logout";

const LandingContent = (readSupplierPendingBooking) => {
    return [
        <Route path="/gms-landing" key="/gms-landing">
            <ExternalLanding
                url="https://info.secur.space/the-gate-management-system-by-sec%C5%ABrspace?hs_preview=uulHOjyR-23988570436"
                height="3000px"
            />
        </Route>,
        <Route path="/search" key="/search">
            <ContextualSearch readSupplierPendingBooking={readSupplierPendingBooking} />
        </Route>,
        <Route path="/about" key="/about">
            <About/>
        </Route>,
        <Route path="/how-it-works" key="/how-it-works">
            <HowItWorks/>
        </Route>,
        <Route path="/contact" key="/contact">
            <Contact/>
        </Route>,
        <Route path="/blog/:id" key="/blog/:id">
            <Blog/>
        </Route>,
        <Route path="/blog" key="/blog">
            <Blog/>
        </Route>,
        <Route path="/faq/:id" key="/faq/:id">
            <Faq fromSinglePost={true}/>
        </Route>,
        <Route path="/faq" key="/faq">
            <Faq/>
        </Route>,
        <Route path="/change-password" key="/change-password">
            <ChangePassword isNewUser={false}/>
        </Route>,
        <Route path="/set-password" key="/set-password">
            <ChangePassword isNewUser={true}/>
        </Route>,
        <Route path="/landing/:id" key="/landing/:id">
            <LandingPage/>
        </Route>,
        <Route path="/booking-approval" key="/booking-approval">
            <BookingApproval />
        </Route>,
        <Route path="/logout" key="/logout">
            <Logout />
        </Route>,
        <Route path="/" key="/">
            <Landing/>
        </Route>,
        <Route path="*" key="/">
            <UserBasedLandingRedirect />
        </Route>
    ]
}

export default LandingContent
