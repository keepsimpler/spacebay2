import { TrackJS } from "trackjs";

class TrackJsContext {

    _username
    _accountId
    _companyName

    updateUserInfo = (user: { username: String, id: String, companyName: String }) : void => {
        const { username, id, companyName } = user || {}
        this._username = username
        this._accountId = id
        this._companyName = companyName
    }

    installTrackJs = () => {
        TrackJS.install({
            token: "568abda71a3849808548c77cf0320cfa",
            network: { error: false },  //We have a custom network error handler to get more info on the error message.
            onError: (payload) => {
                // ignore errors from local environments.
                if (payload.url.indexOf("localhost") >= 0 ||
                    payload.url.indexOf("test.secur.space") >= 0 ||
                    payload.url.indexOf("sandbox.secur.space") >= 0) {
                    return false;
                }

                if(this._username && payload.customer) {
                    payload.customer.userId = this._username
                }

                if(!payload.metadata) {
                    payload.metadata = []
                }

                if(this._accountId) {
                    payload.metadata.push({
                        key: "accountId",
                        value: this._accountId
                    })
                }

                if(this._companyName) {
                    payload.metadata.push({
                        key: "companyName",
                        value: this._companyName
                    })
                }

                return true;
            }
        });
    }

    registerJQueryCapture = () => {
        const $ = window.$

        if($) {
            // Attach a callback for when network errors occur
            $(document).ajaxError(function(evt, xhr, opts) {
                if (!TrackJS) { return; } // Safety Check

                let errorMessage = xhr.responseJSON ? xhr.responseJSON.message : (xhr.status + " " + xhr.statusText + ": " + opts.type + " " + opts.url);

                // Log the relevant info to the Telemetry Console
                TrackJS.console.log({
                    message: errorMessage,
                    method: opts.type,
                    url: opts.url,
                    status: xhr.status,
                    statusText: xhr.statusText
                });

                // Record the Error
                TrackJS.track(errorMessage);
            });
        }
    }
}

export default class TrackJsInitializer {
    static _context = new TrackJsContext()
    static _initialized = false

    static updateUserInfo = (user: { username: String, id: String, companyName: String }) : void => {
        this._context.updateUserInfo(user)
    }

    static initialize = () => {
        if(!this._initialized) {
            this._context.installTrackJs()
            this._context.registerJQueryCapture()
            this._initialized = true
        }

    }
}
