

class SearchQueryStringBuilder {
    _queryString = ""

    _appendPair = (paramName, value) => {
        if(this._queryString === "" && value) {
            this._queryString = `${paramName}=${value}`
        } else if(value) {
            this._queryString += `&${paramName}=${value}`
        }
    }

    build = () : String => {
        return this._queryString
    }

    setLat = (lat: String) => {
        this._appendPair('initLat', lat)
        return this
    }

    setLong = (lng: String) => {
        this._appendPair('initLng', lng)
        return this
    }

    setNumberOfSpaces = (numSpaces: String) => {
        this._appendPair('numSpaces', numSpaces)
        return this
    }

    setStartDate = (startDate: String) => {
        this._appendPair('startDate', startDate)
        return this
    }

    setEndDate = (endDate: String) => {
        this._appendPair('endDate', endDate)
        return this
    }
}

export default SearchQueryStringBuilder
