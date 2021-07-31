export default {
    getQueryVariable(variable) {
        let query = window.location.search.substring(1);
        let vars = query.split("&");
        for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === variable) {
                return pair[1];
            }
        }
        return (false);
    },


    getPath() {
        let urlPath = window.location.pathname.split('?');
        if (urlPath) {
            return urlPath[0];
        }
    },

    getStartPath() {
        //return the begining of the path so privacy-policy/version to return /privacy-policy
        let urlPath = window.location.pathname;
        let lastSlash = urlPath.lastIndexOf("/");
        if (lastSlash === 0) return urlPath;
        else return urlPath.substr(0, urlPath.lastIndexOf("/"));
    },

    getSearch() {
        if (window.location.search) {
            return window.location.search.substring(1);
        }
    },

    createPersistentSearchString(supplierId) {
        let initLat = this.getQueryVariable('initLat');
        let initLng = this.getQueryVariable('initLng');

        let searchParams = {};

        if (initLat && initLng && !supplierId) {
            searchParams = {initLat: initLat, initLng: initLng};
        } else if (initLat && initLng && supplierId) {
            searchParams = {initLat: initLat, initLng: initLng, selectedSupplierId: supplierId};
        }

        return this.createQueryString(searchParams);
    },

    createQueryString(params) {
        let queryString = '';
        let isFirstParam = true;
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                let value = params[key];
                if (isFirstParam) {
                    queryString = '?' + queryString + key + '=' + value;
                    isFirstParam = false;
                } else {
                    queryString = queryString + '&' + key + '=' + value;
                }
            }
        }
        return queryString;
    },

    createSignUpTypeQueryParam(signUpType) {
        return '?type=' + signUpType;
    }
}