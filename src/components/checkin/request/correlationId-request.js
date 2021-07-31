import request from '../../../util/SuperagentUtils';

export const correlationIdRequest = () => {
    return request.get('api/check-in/correlation-id')
}