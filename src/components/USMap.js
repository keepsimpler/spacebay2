import React, {Component} from 'react';
import 'css/components/USMap.css';
import MapData from '../components/MapData';
import {Link} from "react-router-dom";
import {SearchUtils} from "./SearchUtils";
import Search from "../views/Search";

const google = window.google;
const $ = window.$;

class USMap extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.usList = MapData.usList;
        this.defaultState = "CA";

        this.state = {
            "stateCities": [],
            selectedState: "",
            isSearchPage: props.isSearchPage ? props.isSearchPage : false,
            searchSearchLocationName: ""
        };
    }

    initComponents() {

        const locationInput = document.getElementById('searchSearchLocationNameClone');
        if (!locationInput) {
            return;
        }
        this.props.pacSelectFirst(locationInput);
        const options = {
            types: ['(cities)']
        };
        const autocomplete = new window.google.maps.places.Autocomplete(locationInput, options);
        autocomplete.addListener('place_changed', this.searchAutocomplete(autocomplete));


        let wH = $(window).innerHeight();
        $('#ssSearch').height('auto');
        let wH1 = wH - $('#appNav').innerHeight() ;
        $('#us-map').css("minHeight", wH1 - 1 - 20);

    }

    searchAutocomplete = autocomplete => {
        let _this = this;

        return (event) => {
            let place = autocomplete.getPlace();
            let addressParts = Search.getAddressParts(place);
            let foundLocation = SearchUtils.getLocation(place);

            if (foundLocation) {
                this.setState({
                    searchSearchLocation: foundLocation,
                    searchSearchLocationCityState: addressParts.cityState,
                    searchSearchLocationName: addressParts.cityState,
                    searchSearchLocationNameClone: addressParts.cityState
                });
                _this.props.changeSearchData('searchSearchLocationName', addressParts.cityState);
                _this.props.changeSearchData('searchSearchLocationCityState', addressParts.cityState);
                _this.props.changeSearchData('searchSearchLocation', foundLocation);
            } else {
                this.setState({searchSearchLocation: null});
                _this.props.changeSearchData('searchSearchLocation', null);
            }
        }
    };

    handleChange = event => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
        if (name === 'searchSearchLocationNameClone') {
            this.setState({searchSearchLocationNameClone: value, searchSearchLocationName: value});
        }
    };

    zoomOut = () => {
        if (!$('#us-map').hasClass('zoom_2X')) {
            $('#us-map').addClass('zoom_2X');
        }
    };

    zoomIn = () => {
        if ($('#us-map').hasClass('zoom_2X')) {
            $('#us-map').removeClass('zoom_2X');
        }
    };

    getStateCode = stateName => {
        for (let i = 0; i < this.usList.length; i++) {
            if (stateName === this.usList[i]['state']) {
                return this.usList[i]['code'];
            }
        }
        return null;
    };

    getStateName(stateCode) {
        for (let i = 0; i < this.usList.length; i++) {
            if (stateCode === this.usList[i]['code']) {
                return this.usList[i]['state'];
            }
        }
        return null;
    }

    triggerPosition = position => {
        localStorage.setItem("latitude", position.coords.latitude);
        localStorage.setItem("longitude", position.coords.longitude);

        let url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyAOB78aCztD1jfluRP_inQ2UNKRpnmjJPQ";
        $.ajax({
            url: url,
            type: 'GET',
            success: (response) => {
                let state = this.defaultState;
                response.results.pop(); //the result will be an array accordingly google doc
                let item = response.results.pop(), //the result will be an array accordingly google doc
                    tempState = item.formatted_address.split(','),
                    newstate = this.getStateCode(tempState[0]);
                if (newstate) state = newstate;
                $('#' + state).trigger('click');
            },
            error: () => {
                $('#' + this.getStateCode(this.defaultState)).trigger('click');
            }
        });
    };

    blockedPosition = error => {
        $('#' + this.defaultState).trigger('click');
    };

    clickDocument = e => {
        let self = this;
        var component = e.target;
        if (component.tagName === 'path') {
            e.preventDefault();
            e.stopImmediatePropagation();

            let id = $(component).attr("id");
            if (id) {
                $(".is-selected").remove();

                let $this = component.cloneNode(true),
                    bbox = component.getBBox(),
                    centreX = bbox.x + bbox.width / 2,
                    centreY = bbox.y + bbox.height / 2;
                $($this).css("transform-origin", centreX + 'px ' + centreY + 'px').css("transform", "scale(1.15)").addClass("is-selected");
                $($this).attr("id", "");

                component.parentElement.appendChild($this);
                //change popular list by reading from table
                self.getLandingCities(id);
            }
        } else if (component.tagName === 'text') {
            e.preventDefault();
            e.stopImmediatePropagation();

            var state = $(component)[0].innerHTML;
            $('#' + state).trigger('click');
        }

    };

    componentDidMount() {
        this.getStates();

        $(document).bind('click', this.clickDocument);

        this._isMounted = true;

        let state = (this.props.account && this.props.account.state) ? this.props.account.state : "";

        if (!state) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.triggerPosition, this.blockedPosition);
            } else {
                $('#' + this.getStateCode(this.defaultState)).trigger('click');
            }
        } else {
            $('#' + this.getStateCode(state)).trigger('click');
        }

        this.initComponents();

    }

    componentWillUnmount() {
        this._isMounted = false;
        $(document).unbind('click', this.clickDocument);
    }

    getStates = () => {
        let self = this;
        $.ajax({
            url: "/api/cities/getListingStates",
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (response) => {

                for (let i = 0; i < response.length; i++) {
                    let item = response[i];
                    let shortCode = self.getStateCode(item.state);
                    $("#" + shortCode).addClass("blue-path");
                }

            },
            error: (error) => {

            }
        });
    };

    getLandingCities = id => {
        let self = this;
        let state = this.getStateName(id);
        this.setState({selectedState: state});
        $.ajax({
            url: "/api/cities/getCitiesBystate?state=" + state,
            type: 'GET',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            success: (response) => {
                let cityList = [];
                for (let i = 0; i < response.length; i++) {
                    let item = response[i];
                    if (item.rank > 0) {
                        let coordinates = response[i].coordinates.split(',');
                        item.lat = coordinates[0];
                        item.lng = coordinates[1].trim();
                        cityList.push(item);
                    }
                }
                if (self._isMounted) {
                    self.setState({"stateCities": cityList});
                }

            },
            error: (error) => {

            }
        });
    };

    render() {
        let map = MapData.svgMap;
        return (
            <div id="us-map">
                {
                    !this.state.isSearchPage ?
                        <h2>Explore Secure Storage Spaces</h2>
                        :
                        <h1>Find Secure Storage & Parking Near You</h1>
                }
                {
                    this.state.isSearchPage ?
                        <form id="landingInlineSearchForm" className="form-up" onSubmit={e => {
                            e.preventDefault();
                        }}>
                            <div>
                                <input type="text"
                                       id="searchSearchLocationNameClone"
                                       name="searchSearchLocationNameClone"
                                       value={this.state.searchSearchLocationName}
                                       onChange={this.handleChange}
                                       onClick={(e) => e.target.select()}
                                       placeholder="Find A Secure Space Near You"
                                />

                                <span id="searchClone">
                                    <button type="button" onClick={this.props.handleSearch}>
                                        Search
                                    </button>
                                </span>

                            </div>
                        </form>
                        : null
                }

                <div>
                    <div id="map-container">
                        <div id="landing-page-us-map" dangerouslySetInnerHTML={{__html: map}}/>
                    </div>

                    <div id="landing-explore-listings-panel-list">
                        {
                            this.state.selectedState ?
                                <div>
                                    POPULAR CITIES IN <span>{this.state.selectedState}</span>
                                </div>
                                :
                                null
                        }
                        <div>
                            {
                                this.state.stateCities.length > 0 ?
                                    this.state.stateCities.map((item, index) =>
                                        <span className="col-lg-12 col-md-12 col-sm-12 col-xs-6" key={index}>
                                            <Link className="city-link" to={{
                                                pathname: '/search',
                                                search: '?initLat=' + item.lat + '&initLng=' + item.lng
                                            }}>
                                                <img className="img-circle"
                                                     alt=""
                                                     src={item.imageUrl ? item.imageUrl : "../app-images/city_placeholder.jpg"}/>
                                                <span>{item.city}</span>
                                            </Link>
                                        </span>
                                    )

                                    :
                                    <div className="no-city-name">
                                        There are no listings in this state but
                                        <Link to={{
                                            pathname: '/contact',
                                        }}>&nbsp;Contact&nbsp;Us&nbsp;</Link>and let us know where you need space!
                                    </div>
                            }

                        </div>

                    </div>
                    <div className="zoom for-mobile">
                        <button onClick={this.zoomOut}>+</button>
                        <button onClick={this.zoomIn}>-</button>
                    </div>
                </div>

            </div>
        )
    }
}

export default USMap;
