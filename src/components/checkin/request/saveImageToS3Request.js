import request from '../../../util/SuperagentUtils'

export const saveImageToS3Request = (image: File, correlationId: String) => {
    if (image) {
        return request
            .post(`/api/aws-rek`)
            .attach('file', image)
            .field('correlationId', correlationId)
    }
}