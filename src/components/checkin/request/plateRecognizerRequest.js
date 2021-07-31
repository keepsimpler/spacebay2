import request from '../../../util/SuperagentUtils'

export const plateRecognizerRequest = (image: File, correlationId: String) => {
    if (image) {
        return request
            .post(`/api/plate-recognizer`)
            .attach('file', image)
            .field('correlationId', correlationId)
    }
}