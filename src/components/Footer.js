import React, {Component} from 'react'
import { GlobalModalContext } from "../context/global-modal-context";
import Link from 'react-router-dom/es/Link'
import '../css/components/footer.css';
import {withRouter} from "react-router";

class Footer extends Component {

    static contextType = GlobalModalContext

    render() {
        const {location}= this.props;
        const globalModalContext = this.context
        const { showTermsModal, showPrivacyModal } = globalModalContext
        return (
            <footer>
                <section className="ss-footer-section">
                    <div className="ss-footer-icon-container">
                        <div>
                            <Link to="/"><img className="ss-footer-img"
                                              src="../app-images/logo/envase_secur_space_logo_black_white.png"
                                              alt="SecūrSpace"/></Link>
                        </div>
                        <div className="footer-copyright">&copy; SecūrSpace 2021 - All rights reserved</div>
                    </div>

                    <div className="ss-footer-ul">
                        <div className="ss-footer-li">
                            <Link to="/how-it-works"
                                  className={(location.pathname === '/how-it-works' ? " active" : "")}>
                                HOW IT WORKS
                            </Link>
                        </div>
                        <div className="ss-footer-li">
                            <Link to="/about"
                                  className={(location.pathname === '/about' ? " active" : "")}>
                                ABOUT
                            </Link>
                        </div>
                        <div className="ss-footer-li">
                            <Link to="/contact"
                                  className={(location.pathname === '/contact' ? " active" : "")}>
                                CONTACT US</Link>
                        </div>
                        <div className="ss-footer-li">
                            <Link  to="/blog"
                                   className={(location.pathname === '/blog' ? " active" : "")}>BLOG</Link>
                        </div>
                        <div className="ss-footer-li">
                            <Link  to="/faq"
                                   className={(location.pathname === '/faq' ? " active" : "")}>FAQ</Link>
                        </div>
                        <div className="ss-footer-li ss-footer-terms-of-use ">
                             <span  className="footer-link-text pointer" onClick={() => {
                                 showTermsModal()
                             }}>
                            TERMS OF USE
                             </span>
                        </div>
                        <div className="ss-footer-li ss-footer-privacy-policy footer-link-text">
                             <span  className="footer-link-text pointer" onClick={() => {
                                 showPrivacyModal()
                             }}>
                            PRIVACY POLICY</span>
                        </div>
                    </div>
                </section>
            </footer>
        )
    }
}

export default withRouter(Footer);
