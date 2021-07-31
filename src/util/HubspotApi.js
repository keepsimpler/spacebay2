
const hubSpotKey = 'b9ad668c-fc1d-4319-a0d9-b2719a308f37'; // eslint-disable-line
const $ = window.$;

export default {
    createDeal(uuid) {
        return new Promise((resolve, reject) => {
            let url = '/api/newDeal?bookingID=' + encodeURI(uuid);
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                success: (data) => {
                    console.log('success');
                    console.log(data);
                    resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    }
}

