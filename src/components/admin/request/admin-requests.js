import request from '../../../util/SuperagentUtils'

export const requestLogBackInAsAdmin = (onSuccess?: (user: Object) => void,
                                        onFail: (err: Object) => void) : (Promise | void) => {
    const result = request
        .post('/api/login-back-in-as-admin')

    if(onSuccess && onFail) {
        result
            .then((resp) => onSuccess(resp.body))
            .catch((err) => onFail(err))
    } else {
        return result
    }
}
