import { requestCurrentUsername } from "./session-requests";

const TIMEOUT_IN_MILLIS = 60000

class SessionPollerContext {

    _intervalId
    _handleTimeout

    initializeContext = (handleTimeout: () => void) => {
        this.cancelSessionPolling()
        this._handleTimeout = handleTimeout
    }

    beginSessionPolling = () => {
        this._intervalId = setInterval(() => {
            requestCurrentUsername()
                .then((resp) => {
                    const loggedInUsername = resp.text
                    if(!loggedInUsername) {
                        this.cancelSessionPolling()
                        this._handleTimeout()
                    }
                })
                .catch(() => {
                    this.cancelSessionPolling()
                    this._handleTimeout()
                })
        }, TIMEOUT_IN_MILLIS)
    }

    cancelSessionPolling = () => {
        if(this._intervalId) {
            clearInterval(this._intervalId)
            this._intervalId = null
        }
    }
}

export default class SessionPoller {
    static _context = new SessionPollerContext()

    static beginPolling = (handleTimeout: () => void) => {
        this._context.initializeContext(handleTimeout)
        this._context.beginSessionPolling()
    }

    static cancelPolling = () => {
        this._context.cancelSessionPolling()
    }
}
