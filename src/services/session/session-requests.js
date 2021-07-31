import request from '../../util/SuperagentUtils'

export const requestCurrentUsername = (
    onSuccess?: (currentUsername: string) => void,
    onFail?: (err: Object) => void) : void | Promise => {

    const result = request
        .get('/api/current-username')

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

export const requestLoggedInUserDetails = (
    onSuccess?: ({username: string, userType: string}) => void,
    onFail?: (err) => void ) : void | Promise => {

    const result = request
        .get('/api/user-details')

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

export const requestLoggedInAuthoritySource = (onSuccess?: (authority: Object) => void,
                                onFail?: (err: Object) => void) : void | Promise => {
    const result = request
        .get('/api/authority')

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

export const requestLoggedInAccount = (onSuccess?: (account: Object) => void,
                                onFail?: (err: Object) => void) : void | Promise => {
    const result = request
        .get('/api/account')

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}

export const requestLogout = (onSuccess?: (resp: Object) => void,
                              onFail?: (err: Object) => void) : void | Promise => {
    const result = request
        .post('/api/logout')

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}
