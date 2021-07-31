import React, {Component} from 'react';
import FirebaseApp from './FirebaseApp';
import firebase from "firebase/app";
import "firebase/auth";

const $ = window.$;

class FirebaseLogin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            redirectUser: null,
            fromSignUp: props.fromSignUp ? true : false
        };

        this.googleProvider = new firebase.auth.GoogleAuthProvider();
        this.googleProvider.setCustomParameters({
            prompt: 'select_account'
        });
        this.fbProvider = new firebase.auth.FacebookAuthProvider();
        this.fbProvider.setCustomParameters({
            prompt: 'select_account'
        });
    }

    checkUserByEmail = token => {
        let url = `/api/userByToken?token=${token}`

        if(this.props.thirdPartyId) {
            url += `&partnerId=${this.props.thirdPartyId}`
        }

        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                //data: JSON.stringify(expense.toJSON()),
                success: (data) => {
                    resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    componentWillUnmount() {
        this.signOut();
    }

    signOut = e => {
        FirebaseApp.auth().signOut().then(function (response) {
        }).catch(function (error) {
            console.log(error);
        });
    };

    signIn = (type, e) => {
        let self = this;
        if (e) {
            e.preventDefault() // to prevent submit if used within form
        }
        let provider = (type === 'google') ? this.googleProvider : this.fbProvider;
        FirebaseApp.auth().signInWithPopup(provider).then(function (result) {

           // let credential= result.credential;
            let user = result.additionalUserInfo.profile;

            if (type === "google") {
                user.first_name = user.given_name ? user.given_name : "";
                user.last_name = user.family_name ? user.family_name : "";
            }
            user.socialType=type; //add the type of the sm login

            FirebaseApp.auth().currentUser.getIdToken()
                .then(function (result) {
                    //add token to user object
                    user.idToken=result;
                    self.checkUserByEmail(result)
                        .then(function (response) {

                            if(!self.state.fromSignUp){
                                if (response.id) {
                                    self.props.handleSuccess(response);
                                } else {
                                    //go to signup
                                    self.props.setSocialLoginUser(user);
                                    self.setState({redirectUser:true});
                                    self.props.handleSignUpNavigation();
                                }
                            }else{
                                self.props.setSocialLoginUser(user);
                                self.props.handleSuccess(response, user);
                            }

                        }).catch(function (err) {
                        if (err.message) {
                            self.props.handleFailed(err.message);
                        } else {
                            self.props.handleFailed("Failed Login");
                        }
                    });
                }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log(error);
        });
    };


    render() {
        return (
            <div>
                <div className="social-login google">
                    <button id="google-login" onClick={(e) => this.signIn('google', e)}>
                        <span>
                            LOGIN WITH GOOGLE
                        </span>
                    </button>
                </div>
                <div className="social-login fb">
                    <button id="fb-login" onClick={(e) => this.signIn('fb', e)}>
                        <span>
                            LOGIN WITH FACEBOOK
                        </span>
                    </button>
                </div>
            </div>

        )
    }
}


export default FirebaseLogin;
