import _ from 'underscore'

export const getErrorMessageForStandardResponse = (err: Object, defaultErrorMsg: String = "Request Failed") => {
    if(err.status) {
        if(err.response && err.response.body && !_.isEmpty(err.response.body.message)) {
            return err.response.body.message
        } else {
            return defaultErrorMsg
        }
    }

    return "Unable to complete the request potentially due to network connectivity issue"
}
