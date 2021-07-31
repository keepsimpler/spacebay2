import React, { Component } from 'react'
import { GlobalModalContext } from "../../context/global-modal-context";
import { ModalContainer } from 'react-router-modal'
import LoginModalWrapper from "./modal-wrappers/LoginModalWrapper";
import SignUpModalWrapper from "./modal-wrappers/SignUpModalWrapper";
import ForgotPasswordModalWrapper from "./modal-wrappers/ForgotPasswordModalWrapper";
import DynamicPageModalWrapper from "./modal-wrappers/DynamicPageModalWrapper";

class GlobalModalManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contextValue: {
                showLoginModal: this.showLoginModal,
                closeLoginModal: this.closeLoginModal,
                showSignUpModal: this.showSignUpModal,
                closeSignUpModal: this.closeSignUpModal,
                showForgotPasswordModal: this.showForgotPasswordModal,
                closeForgotPasswordModal: this.closeForgotPasswordModal,
                showTermsModal: this.showTermsModal,
                closeTermsModal: this.closeTermsModal,
                showPrivacyModal: this.showPrivacyModal,
                closePrivacyModal: this.closePrivacyModal,
                showVersionedTermsModal: this.showVersionedTermsModal,
                closeVersionedTermsModal: this.closeVersionedTermsModal,
                showVersionedPrivacyModal: this.showVersionedPrivacyModal,
                closeVersionedPrivacyModal: this.closeVersionedPrivacyModal
            },
            displayLoginModal: false,
            loginModalStack: 1,
            displaySignupModal: false,
            signupModalStack: 1,
            displayForgotPasswordModal: false,
            forgotPasswordModalStack: 1,
            displayTermsModal: false,
            termsModalStack: 1,
            displayPrivacyModal: false,
            privacyModalStack: 1,
            showVersionedTermsModal: false,
            versionedTermsModalStack: 1,
            termsModalVersion: null,
            showVersionedPrivacyModal: false,
            versionedPrivacyModalStack: 1,
            privacyModalVersion: null
        }
    }

    showLoginModal = (stack: number = 1) => {
        this.setState({
            displayLoginModal: true,
            loginModalStack: stack
        })
    }

    closeLoginModal = () => {
        this.setState({
            displayLoginModal: false
        })
    }

    showSignUpModal = (stack: number = 1) => {
        this.setState({
            displaySignUpModal: true,
            signUpModalStack: stack
        })
    }

    closeSignUpModal = () => {
        this.setState({
            displaySignUpModal: false
        })
    }

    showForgotPasswordModal = (stack: number = 1) => {
        this.setState({
            displayForgotPasswordModal: true,
            forgotPasswordModalStack: stack
        })
    }

    closeForgotPasswordModal = () => {
        this.setState({
            displayForgotPasswordModal: false
        })
    }

    showTermsModal = (stack: number = 1) => {
        this.setState({
            displayTermsModal: true,
            termsModalStack: stack
        })
    }

    closeTermsModal = () => {
        this.setState({
            displayTermsModal: false
        })
    }

    showPrivacyModal = (stack: number =  1) => {
        this.setState({
            displayPrivacyModal: true,
            privacyModalStack: stack
        })
    }

    closePrivacyModal = () => {
        this.setState({
            displayPrivacyModal: false
        })
    }

    showVersionedTermsModal = (version: number, stack: number = 1) => {
        this.setState({
            displayVersionedTermsModal: true,
            versionedTermsModalStack: stack,
            termsModalVersion: version
        })
    }

    closeVersionedTermsModal = () => {
        this.setState({
            displayVersionedTermsModal: false,
            termsModalVersion: null
        })
    }

    showVersionedPrivacyModal = (version: number, stack: number =  1) => {
        this.setState({
            displayVersionedPrivacyModal: true,
            versionedPrivacyModalStack: stack,
            privacyModalVersion: version
        })
    }

    closeVersionedPrivacyModal = () => {
        this.setState({
            displayVersionedPrivacyModal: false,
            privacyModalVersion: null
        })
    }

    render() {
        return (
            <GlobalModalContext.Provider value={this.state.contextValue}>

                {this.props.children}

                {
                    this.state.displayLoginModal &&
                        <LoginModalWrapper
                            closeModal={this.closeLoginModal}
                            stack={this.state.loginModalStack}
                            handleForgotPasswordNavigation={() => {
                                this.closeLoginModal()
                                this.showForgotPasswordModal()
                            }}
                            handleSignUpNavigation={() => {
                                this.closeLoginModal()
                                this.showSignUpModal()
                            }}
                        />
                }

                {
                    this.state.displaySignUpModal &&
                        <SignUpModalWrapper
                            closeModal={this.closeSignUpModal}
                            stack={this.state.signUpModalStack}
                            handleNavigateToLogin={() => {
                                this.closeSignUpModal()
                                this.showLoginModal()
                            }}
                            handleNavigateToSignup={() => {
                                this.closeSignUpModal()
                                this.showSignUpModal()
                            }}
                        />
                }

                {
                    this.state.displayForgotPasswordModal &&
                        <ForgotPasswordModalWrapper
                            closeModal={this.closeForgotPasswordModal}
                            stack={this.state.forgotPasswordModalStack}
                        />
                }

                {
                    this.state.displayTermsModal &&
                        <DynamicPageModalWrapper
                            closeModal={this.closeTermsModal}
                            stack={this.state.termsModalStack}
                            type="terms"
                        />
                }

                {
                    this.state.displayPrivacyModal &&
                        <DynamicPageModalWrapper
                            closeModal={this.closePrivacyModal}
                            stack={this.state.privacyModalStack}
                            type="privacy-policy"
                        />
                }

                {
                    this.state.displayVersionedTermsModal && this.state.termsModalVersion &&
                    <DynamicPageModalWrapper
                        closeModal={this.closeVersionedTermsModal}
                        stack={this.state.termsModalStack}
                        version={this.state.termsModalVersion}
                        type="terms"
                    />
                }

                {
                    this.state.displayVersionedPrivacyModal && this.state.privacyModalVersion &&
                    <DynamicPageModalWrapper
                        closeModal={this.closeVersionedPrivacyModal}
                        stack={this.state.privacyModalStack}
                        version={this.state.privacyModalVersion}
                        type="privacy-policy"
                    />
                }

                <ModalContainer />
            </GlobalModalContext.Provider>
        )
    }
}

export default GlobalModalManager
