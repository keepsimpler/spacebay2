import {requestAddStripePaymentMethod} from "../request/payment-method-requests";
import Busy from "../../Busy";

export default class StripeService {
    constructor(
        env: { platformPublishedKey: string },
        authority: { id: String, email: String, userType: String },
        onSuccess: (paymentMethod: Object) => void,
        onFail: (err: Object) => void) {

        this.env = env

        this.loadStripe()
        this.loadStripeCheckout(authority, onSuccess, onFail)
    }

    loadStripe = () => {
        if (!window.Stripe) {
            const script = document.createElement('script')
            script.onload = this.configureStripe
            script.src = 'https://js.stripe.com/v3'
            document.head.appendChild(script)
        } else {
            this.configureStripe()
        }
    }

    configureStripe = () => {
        const {platformPublishedKey} = this.env
        this.stripe = window.Stripe(platformPublishedKey)
    }

    loadStripeCheckout = (
        authority: { id: String, email: String, userType: String },
        onSuccess: (paymentMethod: Object) => void,
        onFail: (err: Object) => void
    ) => {
        if (!window.StripeCheckout) {
            const script = document.createElement('script')
            script.onload = () => this.configureStripeCheckout(authority, onSuccess, onFail)
            script.src = 'https://checkout.stripe.com/checkout.js'
            document.head.appendChild(script)
        } else {
            this.configureStripeCheckout(authority, onSuccess, onFail)
        }
    }

    configureStripeCheckout = (
        authority: { email: String, id: String, userType: String },
        onSuccess: (paymentMethod: Object) => void,
        onFail: (err: Object) => void
    ) => {
        const {email, id, userType} = authority

        this.stripeCheckoutHandler = window.StripeCheckout.configure({
            key: this.env.platformPublishedKey,
            image: "https://s3-us-west-1.amazonaws.com/securspace-files/app-images/favicon.ico",
            locale: "auto",
            zipCode: true,
            name: "Add Payment Method",
            panelLabel: "Add Payment Method",
            color: "black",
            email: email,
            token: (token) => {
                this._requestAddStripePaymentMethodWrapper({
                        authorityId: id,
                        stripeToken: token.id,
                        userType
                    },
                    onSuccess,
                    onFail
                )
            }
        })
    }

    _requestAddStripePaymentMethodWrapper = (
        data: { authorityId: String, stripeToken: String, userType: string},
        onSuccess: (paymentMethod: Object) => void,
        onFail: (err: Object) => void
    ) => {
        Busy.set(true)

        requestAddStripePaymentMethod(
            data,
            (resp) => {
                Busy.set(false)
                onSuccess(resp.body)
            },
            (err) => {
                Busy.set(false)
                onFail(err)
            }
        )

    }

    openStripeCheckout = () => {
        if (this.stripeCheckoutHandler) {
            this.stripeCheckoutHandler.open({
                name: 'SecurSpace',
                description: 'Add Payment Method'
            })
        } else {
            console.warn("Attempting to open Stripe checkout with no viable instance")
        }
    }

    closeStripeCheckout = () => {
        if (this.stripeCheckoutHandler) {
            this.stripeCheckoutHandler.close()
        }
    }

    createStripeToken = (
        data: { routingNumber: String, accountNumber: String, accountHolderName: String, accountHolderType: String },
        onSuccess: (token: String) => void,
        onFail: (err: Object) => void
    ) => {

        const {routingNumber, accountNumber, accountHolderName, accountHolderType} = data

        if (this.stripe) {
            this.stripe.createToken('bank_account', {
                country: 'US',
                currency: 'usd',
                routing_number: routingNumber,
                account_number: accountNumber,
                account_holder_name: accountHolderName,
                account_holder_type: accountHolderType,
            }).then((result) => {
                const {error} = result
                if (error) {
                    onFail(error)
                } else {
                    const { token } = result
                    onSuccess(token.id)
                }
            })
        } else {
            console.warn("Attempting to create stripe token with no viable instance")
        }
    }
}
