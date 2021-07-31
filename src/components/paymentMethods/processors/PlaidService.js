import {requestAddPlaidPaymentMethod} from "../request/payment-method-requests";
import Busy from "../../Busy";

export default class PlaidService {
    constructor(
        env: { plaidEnvironment: String, plaidClientName: String, plaidPublicKey: String },
        authority: {id: String, userType: String},
        onSuccess : Function,
        onFail : Function
        ) {
        this.env = env

        this.loadPlaid(authority, onSuccess, onFail)

    }

    loadPlaid = (authority: { id: String }, onSuccess: Function, onFail: Function) => {
        if(!window.Plaid) {
            const script = document.createElement('script')
            script.onload = () => this.configurePlaid(authority, onSuccess, onFail)
            script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
            document.head.appendChild(script)
        } else {
            this.configurePlaid(authority, onSuccess, onFail)
        }
    }

    configurePlaid = (authority: { id: String, userType: String }, onSuccess, onFail) => {
        const { plaidEnvironment,  plaidClientName, plaidPublicKey } = this.env
        const { id, userType } = authority

        this.plaidHandler = window.Plaid.create({
            env: plaidEnvironment,
            clientName: plaidClientName,
            key: plaidPublicKey,
            product: ['auth'],
            selectAccount: true,
            onSuccess: (public_token, metadata) => {
                this._requestAddPlaidPaymentMethodWrapper({
                    authorityId: id,
                    plaidPublicToken: public_token,
                    plaidAccountId: metadata.account_id,
                    userType
                }, onSuccess, onFail)
            },
            onExit: (err, metadata) => {
                // todo za -- implement?
            }
        })
    }

    _requestAddPlaidPaymentMethodWrapper = (
        data: { authorityId: String, plaidPublictoken: String, plaidAccountId: String, userType: String },
        onSuccess: (paymentMethod: Object) => void,
        onFail: (err: Object) => void
    ) => {
        Busy.set(true)
        requestAddPlaidPaymentMethod(
            data,
            (paymentMethod) => {
                Busy.set(false)
                onSuccess(paymentMethod)
            },
            (err) => {
                Busy.set(false)
                onFail(err)
            }
        )
    }

    openPlaidHandler = () => {
        if(this.plaidHandler) {
            this.plaidHandler.open()
        } else {
            console.warn("Attempting to open plaid handler with no viable instance")
        }
    }

    closePlaidHandler = () => {
        if(this.plaidHandler) {
            this.plaidHandler.exit()
        }
    }
}
