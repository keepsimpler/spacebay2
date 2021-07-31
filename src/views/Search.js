import React, { Component } from 'react';
import URLUtils from '../util/URLUtils';
import '../css/views/search.css';
import '../css/components/badge.css';
import SupplierDetails from "../components/SupplierDetails";
import { SearchUtils } from "../components/SearchUtils";
import SupplierMap from "../components/SupplierMap";
import SupplierList from "../components/SupplierList";
import Busy from "../components/Busy";
import LocationFeatures from "../components/LocationFeatures";
import EquipmentTypes from "../components/EquipmentTypes";
import { createLogoutOnFailureHandler } from "../util/LogoutUtil";
import MultipleSelectCriteria from "../components/MultipleSelectCriteria";
import { toast } from 'react-toastify';
import NoLocationMap from "../components/NoLocationMap";
import NoSupplierList from "../components/NoSupplierList";
import { Helmet } from "react-helmet";
import USMap from "../components/USMap";
import SearchUtilService from "../services/search/SearchUtilService";
import { UserType } from "../components/constants/securspace-constants";

const google = window.google;
const $ = window.$;

class Search extends Component {
    constructor(props) {
        super(props);

        let _this = this;
        let initLat = URLUtils.getQueryVariable('initLat');
        let initLng = URLUtils.getQueryVariable('initLng');
        const numSpaces = URLUtils.getQueryVariable('numSpaces')
        const startDate = URLUtils.getQueryVariable('startDate')
        const endDate = URLUtils.getQueryVariable('endDate')

        let initLocation;
        let initLocationName;
        let initLocationCityState;
        let initUnfilteredSuppliers;
        if (initLat && initLng) {
            initLocation = null;
            initLocationName = '';
            initLocationCityState = '';
            initUnfilteredSuppliers = [];
        } else {
            initLocation = this.props.location;
            initLocationName = this.props.locationName;
            initLocationCityState = this.props.locationCityState;
            initUnfilteredSuppliers = this.props.unfilteredSuppliers;
        }

        let initEquipmentTypes = this.props.equipmentTypes ? this.props.equipmentTypes : SearchUtilService.createLocationItemList(EquipmentTypes.OPTIONS, "searchEquipmentType");
        let initLocationFeatures = this.props.locationFeatures ? this.props.locationFeatures : SearchUtilService.createLocationItemList(LocationFeatures.OPTIONS, "searchLocationFeatures");
        let initFilteredSuppliers = initUnfilteredSuppliers && initUnfilteredSuppliers.length > 0 ?
            Search.filterSuppliers(initUnfilteredSuppliers, initEquipmentTypes, initLocationFeatures) : [];

        let selectedSupplierIdFromUrl = URLUtils.getQueryVariable('selectedSupplier');
        let selectedSupplier = this.props.selectedSupplier;

        if (!selectedSupplier && selectedSupplierIdFromUrl) {
            selectedSupplier = {
                locationId: selectedSupplierIdFromUrl
            };
        }

        this.state = {
            selectedSupplier: selectedSupplier,
            suppliers: initFilteredSuppliers,
            unfilteredSuppliers: [],
            recurringBooking: this.props.recurringBooking,
            frequencyTypeOptions: this.props.frequencyTypeOptions,
            selectedFrequencyType: this.props.selectedFrequencyType,
            selectedFrequencyTypeOption: this.props.selectedFrequencyTypeOption,
            endDate: this.props.endDate,
            numberOfSpaces: numSpaces ? numSpaces : this.props.numberOfSpaces,
            equipmentTypes: initEquipmentTypes,
            equipmentTypesSelectedCount: 0,
            locationFeatures: initLocationFeatures,
            locationTypesSelectedCount: 0,
            infoMessage: '',
            noSuppliersMessage: false,
            showSearchCriteria: false,
            paymentMethods: [],
            equipmentTypeSelectorVisible: false,
            locationFeaturesSelectorVisible: false,
            allEquipmentTypesSelected: false,
            allLocationFeaturesSelected: false,
            searchSearchLocation: initLocation,
            //This prevents the map from loading prematurely
            searchedLocation: initLocation,
            searchSearchLocationName: initLocationName,
            searchSearchLocationCityState: initLocationCityState,
            searchSearchStartDate: startDate ? startDate : this.props.startDate,
            searchSearchEndDate: endDate ? endDate : this.props.endDate,
            toggleOn: false,
            url: window.location.href,
            displayMap: false
        };

        document.onclick = function (event) {
            let target = event.target,
                targetId = $(target).attr('id'),
                parent = event.target.parentElement,
                parentId = $(parent).attr('id');

            if (_this.state.locationFeaturesSelectorVisible === true || _this.state.equipmentTypeSelectorVisible === true) {
                if ((targetId || parentId)) {
                    if (!(targetId === 'searchEquipmentTypeItem' || parentId === 'searchEquipmentTypeItem')) {
                        _this.setState({ equipmentTypeSelectorVisible: false });
                    }

                    if (!(targetId === 'searchLocationFeaturesItems' || parentId === 'searchLocationFeaturesItems')) {
                        _this.setState({ locationFeaturesSelectorVisible: false });
                    }
                }
            } else {
                if (targetId === 'searchEquipmentTypeItem' || parentId === 'searchEquipmentTypeItem') {
                    _this.setState({ equipmentTypeSelectorVisible: true });
                }

                if (targetId === 'searchLocationFeaturesItems' || parentId === 'searchLocationFeaturesItems') {
                    _this.setState({ locationFeaturesSelectorVisible: true });
                }
            }

        }
    }

    componentDidMount() {
        let _this = this;
        this.initComponents();

        let initLat = URLUtils.getQueryVariable('initLat');
        let initLng = URLUtils.getQueryVariable('initLng');

        if (initLat && initLng) {

            new window.google.maps.Geocoder().geocode({
                'location': {
                    lat: parseFloat(initLat),
                    lng: parseFloat(initLng)
                }
            }, function (results, status) {
                if (status === 'OK') {
                    let place = results[0];
                    let addressParts = Search.getAddressParts(place);
                    _this.handleSearch(
                        place.geometry.location,
                        place.formatted_address,
                        addressParts.cityState,
                        _this.state.recurringBooking,
                        _this.state.frequencyTypeOptions,
                        _this.state.selectedFrequencyType,
                        _this.state.selectedFrequencyTypeOption,
                        _this.state.searchSearchStartDate,
                        _this.state.searchSearchEndDate,
                        _this.state.numberOfSpaces
                    );
                } else {
                    _this.onError('Error:  Unable to show location on map');
                }
            });
        } else if ((!this.state.unfilteredSuppliers || this.state.unfilteredSuppliers.length === 0) &&
            this.state.searchSearchLocation && this.state.searchSearchLocationName &&
            this.state.searchSearchStartDate && this.state.searchSearchEndDate && this.state.numberOfSpaces) {
            this.fetchSuppliers(
                this.state.searchSearchLocation,
                this.state.searchSearchLocationName,
                this.state.searchSearchLocationCityState,
                this.state.searchSearchStartDate,
                this.state.searchSearchEndDate,
                this.state.numberOfSpaces
            );

        } else {
            //find location and suppliers by ip
            this.startPage();

        }

        this.loadPaymentMethods(this.props.account ? this.props.account.id : null);
    }

    componentWillUnmount() {
        document.onclick = null;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.account !== nextProps.account) {

            if (nextProps.account && nextProps.account.id) {
                this.loadPaymentMethods(nextProps.account ? nextProps.account.id : null);
            }
            this.setState({ unfilteredSuppliers: [] });
        }
    }


    changeSearchData = (key, value) => {
        let object = {};
        object[key] = value;
        this.setState(object);
    };

    findResults = (initLat, initLng) => {
        let _this = this;
        _this.setState({ error: null });
        if (initLat && initLng) {
            new window.google.maps.Geocoder().geocode({
                'location': {
                    lat: parseFloat(initLat),
                    lng: parseFloat(initLng)
                }
            }, function (results, status) {
                if (status === 'OK') {
                    let place = results[0];
                    let addressParts = Search.getAddressParts(place);
                    for (let i = 0; i < results.length; i++) {
                        if (results[i].types.indexOf('postal_code') > -1) {
                            place = results[i];
                            break;
                        }
                    }
                    _this.handleSearch(
                        place.geometry.location,
                        place.formatted_address,
                        addressParts.cityState,
                        _this.state.recurringBooking,
                        _this.state.frequencyTypeOptions,
                        _this.state.selectedFrequencyType,
                        _this.state.selectedFrequencyTypeOption,
                        _this.state.searchSearchStartDate,
                        _this.state.searchSearchEndDate,
                        _this.state.numberOfSpaces
                    );
                } else {
                    _this.displayMap();
                }
            });

        }
    };

    searchByIp = () => {
        let _this = this;
        this.getLocation().then(function (values) {
            Busy.set(false);
            _this.setState({ error: null });
            if (values && (typeof values.ip !== 'undefined') && values.longitude && values.latitude) {
                _this.findResults(values.latitude, values.longitude);
            }
            else {
                _this.displayMap();
            }

        }).catch(function (error) {
            Busy.set(false);
            let err = error;
            err.customMessage = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : '';
            _this.setState({
                error: err,
                data: null
            });

        });
    };

    startPage = () => {
        let _this = this;
        const searchSearchLocation = localStorage.getItem('searchSearchLocation');
        const searchSearchLocationName = localStorage.getItem('searchSearchLocationName');
        const searchSearchLocationCityState = localStorage.getItem('searchSearchLocationCityState');

        if (searchSearchLocation && searchSearchLocationName && searchSearchLocationCityState) {
            //preserve last search
            _this.handleSearch(
                JSON.parse(searchSearchLocation),
                searchSearchLocationName,
                searchSearchLocationCityState,
                _this.state.recurringBooking,
                _this.state.frequencyTypeOptions,
                _this.state.selectedFrequencyType,
                _this.state.selectedFrequencyTypeOption,
                _this.state.searchSearchStartDate,
                _this.state.searchSearchEndDate,
                _this.state.numberOfSpaces
            );
            return;
        }

        const latitude = localStorage.getItem('latitude');
        const longitude = localStorage.getItem('longitude');

        if (latitude && longitude) {
            //already have the coordinates
            _this.findResults(latitude, longitude);
        } else {
            //get location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        localStorage.setItem("latitude", position.coords.latitude);
                        localStorage.setItem("longitude", position.coords.longitude);
                        _this.findResults(position.coords.latitude, position.coords.longitude);
                    }, this.searchByIp);
            } else {
                this.searchByIp();
            } //end if exists geolocation

        }//end if position already calculated

    };

    initComponents = () => {
        this.initDatePickers();
        const locationInput = document.getElementById('searchSearchLocationName');

        this.pacSelectFirst(locationInput);
        const options = {
            types: ['(cities)']
        };
        const autocomplete = new window.google.maps.places.Autocomplete(locationInput, options);
        autocomplete.addListener('place_changed', this.createPlaceAutocompleteOnChange(autocomplete));
        //ssSearch minim height
        let wH = $(window).innerHeight();
        let wW = $(window).innerWidth();
        let wH1 = wH - $('#appNav').innerHeight() - $('#searchInlineSearchForm').innerHeight();
        $('#searchMap').css("minHeight", wH1 - 1 - 20);

        if (wW > 500) {
            $('#ssSearch').height(wH1 - 1 - 20);
        }
    };

    setUrl = value => {
        this.setState({ url: value });
    };

    getLocation = page => {
        return new Promise((resolve, reject) => {
            let url = '/api/getByIpLocation';
            $.ajax({
                url: url,
                type: 'GET',
                contentType: 'application/json; charset=UTF-8',
                dataType: "json",
                success: (data) => {
                    resolve(data);
                },
                error: (data) => {
                    reject(data);
                }
            });
        });
    };

    initDatePickers = () => {
        $('#searchSearchStartDate').datepicker({
            format: 'm/d/yyyy',
            startDate: new Date()
        }).on('changeDate', this.handleChange);
        $('#searchSearchEndDate').datepicker({
            format: 'm/d/yyyy',
            startDate: new Date()
        }).on('changeDate', this.handleChange);
        $('#searchSearchDatesFieldset').datepicker({
            inputs: $('#searchSearchStartDate, #searchSearchEndDate')
        });

    };

    pacSelectFirst = input => {
        let _this = this;
        // store the original event binding function
        let _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

        function addEventListenerWrapper(type, listener) {
            // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
            // and then trigger the original listener.
            if (type === "keydown") {
                let orig_listener = listener;
                listener = function (event) {
                    let suggestion_selected = $(".pac-item-selected").length > 0;
                    if (event.which === 13 && !suggestion_selected) {
                        let visibleAutocompleteDropdowns = $('.pac-container:visible');
                        if (visibleAutocompleteDropdowns && visibleAutocompleteDropdowns.length > 0) {
                            let simulated_downarrow = $.Event("keydown", {
                                keyCode: 40,
                                which: 40
                            });
                            orig_listener.apply(input, [simulated_downarrow]);
                        } else {
                            _this.handleSearchValidation();
                        }
                    }

                    orig_listener.apply(input, [event]);
                };
            }

            _addEventListener.apply(input, [type, listener]);
        }

        input.addEventListener = addEventListenerWrapper;
        input.attachEvent = addEventListenerWrapper;
    };

    createPlaceAutocompleteOnChange = autocomplete => {
        return (event) => {
            let place = autocomplete.getPlace();
            let addressParts = Search.getAddressParts(place);
            let foundLocation = SearchUtils.getLocation(place);

            if (foundLocation) {
                this.setState({
                    searchSearchLocation: foundLocation,
                    searchSearchLocationName: addressParts.cityState,
                    searchSearchLocationCityState: addressParts.cityState
                });
            } else {
                this.setState({
                    searchSearchLocation: null
                });
            }
        };
    };

    static getAddressParts(place) {
        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zip = '';
        let country = '';

        let geoLocation = place.geometry.location;

        for (let i = 0; i < place.address_components.length; i++) {
            let addressType = place.address_components[i].types[0];
            let addressType2 = '';
            if (place.address_components[i].types.length === 2) {
                addressType2 = place.address_components[i].types[1];
            }

            if (addressType === 'street_number') {
                streetNumber = place.address_components[i]['short_name'];
            } else if (addressType === 'route') {
                route = place.address_components[i]['long_name'];
            } else if (addressType === 'locality') {
                city = place.address_components[i]['long_name'];
            } else if (addressType === 'administrative_area_level_1') {
                state = place.address_components[i]['long_name'];
            } else if (addressType === 'postal_code') {
                zip = place.address_components[i]['short_name'];
            } else if (addressType2 === 'political' && !city) {
                city = place.address_components[i]['long_name'];
            } else if (addressType === 'country') {
                country = place.address_components[i]['long_name'];
            }
        }

        return {
            lookupLocation: place.formatted_address,
            addressLine1: streetNumber + ' ' + route,
            addressLine2: '',
            city: city,
            state: state,
            zip: zip,
            addressLatitude: geoLocation.lat(),
            addressLongitude: geoLocation.lng(),
            cityState: city + ', ' + (state ? state : country)
        };
    }

    handleChange = event => {
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if ('searchCriteriaNumberOfSpaces' === name && (!SearchUtils.isInteger(value) || value > 9999)) {
            return;
        }
        if ('searchSearchStartDate' === name) {
            if (value !== this.state.searchCriteriaEndDate && !this.state.recurringBooking) {
                //This condition is only true if the date range feature has auto-updated the searchSearchStartDate because
                //the searchCriteriaEndDate was set to a date before the searchSearchStartDate.  So no need to auto-focus
                //on the endDate field in the date range.
                $('#searchSearchEndDate').focus();
            }
            this.setState(function (prevState) {
                return SearchUtils.getUpdatedRecurringProperties(value, prevState.recurringBooking, prevState.selectedFrequencyType,
                    prevState.selectedFrequencyTypeOption);
            });
        }
        if ('selectedFrequencyTypeOption' === name) {
            this.setState(function (prevState) {
                return SearchUtils.getUpdatedRecurringProperties(prevState.searchSearchStartDate,
                    prevState.recurringBooking, prevState.selectedFrequencyType, value);
            });
            return;
        }
        if ('searchCriteriaEquipmentTypes' === name) {
            this.props.handleEquipmentTypesFilterChange(value);
        }
        if ('searchCriteriaLocationFeatures' === name) {
            this.props.handleLocationFeaturesFilterChange(value);
        }

        this.setState({ [name]: value });

        if ('searchSearchStartDate' === name || 'searchSearchEndDate' === name) {
            this.props.handleSearch(
                this.state.searchSearchLocation,
                this.state.searchSearchLocationName,
                this.state.searchSearchLocationCityState,
                this.state.recurringBooking,
                this.state.frequencyTypeOptions,
                this.state.selectedFrequencyType,
                this.state.selectedFrequencyTypeOption,
                'searchSearchStartDate' === name ? value : this.state.searchSearchStartDate,
                'searchSearchEndDate' === name ? value : this.state.searchSearchEndDate,
                this.state.numberOfSpaces
            );
        }
    };

    handleSearchValidation = () => {
        this.setState({ errorMessage: null });

        let isError = false;

        if (!this.state.searchSearchLocationName) {
            isError = true;
            toast.error("Please enter a valid location");
        }
        if (!this.state.searchSearchStartDate) {
            isError = true;
            toast.error("Please enter a valid From Date");
        }
        if (!this.state.searchSearchEndDate) {
            isError = true;
            toast.error("Please enter a valid Until Date");
        }

        if (isError) {
            return;
        }
        localStorage.setItem('searchSearchLocation', JSON.stringify(this.state.searchSearchLocation));
        localStorage.setItem('searchSearchLocationName', this.state.searchSearchLocationName);
        localStorage.setItem('searchSearchLocationCityState', this.state.searchSearchLocationCityState);

        this.handleSearch(
            this.state.searchSearchLocation,
            this.state.searchSearchLocationName,
            this.state.searchSearchLocationCityState,
            this.state.recurringBooking,
            this.state.frequencyTypeOptions,
            this.state.selectedFrequencyType,
            this.state.selectedFrequencyTypeOption,
            this.state.searchSearchStartDate,
            this.state.searchSearchEndDate,
            this.state.numberOfSpaces
        );
    };

    loadPaymentMethods = accountId => {
        if (accountId) {
            $.ajax({
                url: 'api/payment-method?accountId=' + accountId,
                type: 'GET',
                success: this.paymentMethodsLoaded,
                statusCode: {
                    401: createLogoutOnFailureHandler(this.props.handleLogout)
                },
                error: this.paymentMethodsFailedToLoad
            });
        }
    };

    paymentMethodsLoaded = (data) => {
        this.setState({ paymentMethods: data });
    };

    paymentMethodsFailedToLoad = (jqXHR, textStatus, errorThrown) => {
        this.setState({
            paymentMethods: [],
            errorMessage: "Failed to load payment methods."
        });

    };

    clearErrors = () => {
        this.setState({ infoMessage: null });
    };

    handleErrors = message => {
        this.setState({ infoMessage: message });
    };

    getNoSuppliersMessage = () => {
        return this.state.searchSearchLocationName ? "We're sorry but there are currently no Suppliers in this area that match the Search criteria.  Contact us at info@secur.space to let us know you need space here and we'll find some for you!" : 'Please perform a search to see Suppliers.';
    };

    handleSupplierDetailClose = () => {
        this.setState({ selectedSupplier: null });
        this.props.handleSupplierSelected(null);
        window.history.replaceState({}, '', this.props.baseUrlPath);
        this.setState({ url: window.location.href });
        //window.history.back();
    };

    hideSearchCriteria = () => {
        this.setState({ showSearchCriteria: false });
    };

    showSearchCriteria = () => {
        this.setState({ showSearchCriteria: false });
    };

    handleSupplierSelected = supplier => {
        this.setState({ selectedSupplier: supplier });
        this.props.handleSupplierSelected(supplier);
        this.setState({ url: window.location.href });
    };

    handleSearch = (
        location,
        locationName,
        locationCityState,
        recurringBooking,
        frequencyTypeOptions,
        selectedFrequencyType,
        selectedFrequencyTypeOption,
        startDate,
        endDate,
        numberOfSpaces
    ) => {

        this.fetchSuppliers(location, locationName, locationCityState, startDate, endDate, numberOfSpaces);

        //Reset the stored filters everytime a search occurs
        // let equipmentTypes = App.createLocationItemList(EquipmentTypes.OPTIONS, "searchEquipmentType");
        // let locationFeatures = App.createLocationItemList(LocationFeatures.OPTIONS, "searchLocationFeatures");

        this.setState({
            searchedLocation: location,
            searchSearchLocation: location,
            searchSearchLocationName: locationCityState,
            searchSearchLocationCityState: locationCityState,
            recurringBooking: recurringBooking,
            frequencyTypeOptions: frequencyTypeOptions,
            selectedFrequencyType: selectedFrequencyType,
            selectedFrequencyTypeOption: selectedFrequencyTypeOption,
            searchSearchStartDate: startDate,
            searchSearchEndDate: endDate,
            numberOfSpaces: numberOfSpaces,
            // equipmentTypes: equipmentTypes,
            // locationFeatures: locationFeatures
        });

        this.props.handleSearch(
            location,
            locationName,
            locationCityState,
            recurringBooking,
            frequencyTypeOptions,
            selectedFrequencyType,
            selectedFrequencyTypeOption,
            startDate,
            endDate,
            numberOfSpaces,
            // equipmentTypes,
            // locationFeatures
        );
        let wH = $(window).innerHeight();
        let wW = $(window).innerWidth();
        let wH1 = wH - $('#appNav').innerHeight() - $('#searchInlineSearchForm').innerHeight();
        $('#searchMap').css("minHeight", wH1 - 1 - 20);

        if (wW > 500) {
            $('#ssSearch').height(wH1 - 1 - 20);
        }
    };

    fetchSuppliers = (
        location,
        locationName,
        locationCityState,
        startDate,
        endDate,
        numberOfSpaces
    ) => {
        Busy.set(true);
        this.setState({
            supplierListLocationName: locationName,
            supplierListDisplayName: locationCityState
        });
        let lat, lng;
        try {
            lat = location.lat();
            lng = location.lng();
        } catch (e) {
            lat = location.lat;
            lng = location.lng;
        }

        lat = (lat ? lat : '');
        lng = (lng ? lng : '');

        $.ajax({
            url: 'http://localhost:3005/suppliers?startDate=7/28/2021&endDate=8/1/2021&numberOfSpaces=1&lat=37.7749295&lon=-122.4194155', // +
                // 'lat=' + lat +
                // '&lon=' + lng +
                // '&startDate=' + startDate +
                // '&endDate=' + endDate +
                // '&numberOfSpaces=' + numberOfSpaces,
            type: 'GET',
            success: this.onSuccess,
            error: this.onError
        });
    };

    onSuccess = (unfilteredSuppliers) => {
        Busy.set(false);

        //check by eq types and location features;
        if (this.state.equipmentTypesSelectedCount > 0 || this.state.locationTypesSelectedCount > 0) {
            unfilteredSuppliers = this.filterByEqAndLocationFeatures(unfilteredSuppliers);
        }

        let selectedSupplier = this.findSelectedSupplier(this.state.selectedSupplier, unfilteredSuppliers);

        this.setState({
            unfilteredSuppliers: unfilteredSuppliers,
            suppliers: unfilteredSuppliers,
            selectedSupplier: selectedSupplier,
            noSuppliersMessage: !unfilteredSuppliers || unfilteredSuppliers.length === 0,
            showSearchCriteria: false,
            infoMessage: null
        });
        this.props.handleSupplierSelected(selectedSupplier);
        this.props.handleUnfilteredSuppliers(unfilteredSuppliers);
        this.displayMap();
    };

    filterByEqAndLocationFeatures = searchResults => {
        if (searchResults.length === 0) return [];


        let searchEqTypes = Object.keys(this.state.equipmentTypes).filter((key) => {
            return this.state.equipmentTypes[key].value;
        }).map((key) => {
            return this.state.equipmentTypes[key].label;
        });

        let searchFeatures = Object.keys(this.state.locationFeatures).filter((key) => {
            return this.state.locationFeatures[key].value;
        }).map((key) => {
            return this.state.locationFeatures[key].label;
        });

        if (searchEqTypes.length > 0) {
            let foundSuppliers = searchResults.filter(function (supplier) {
                let eqcommon = supplier.equipmentTypes.filter(function (n) {
                    return searchEqTypes.indexOf(n) !== -1;
                });

                return eqcommon.length > 0;
            });
            if (foundSuppliers.length === 0) return [];
            else searchResults = foundSuppliers;
        }

        if (searchFeatures.length > 0) {
            let foundSuppliers = searchResults.filter(function (supplier) {
                let locationcommon = supplier.features.filter(function (n) {
                    return searchFeatures.indexOf(n) !== -1;
                });

                return locationcommon.length > 0;
            });
            if (foundSuppliers.length === 0) return [];
            else searchResults = foundSuppliers;
        }

        return searchResults;
    };

    findSelectedSupplier(selectedSupplier, unfilteredSuppliers) {

        if (selectedSupplier && unfilteredSuppliers) {
            let foundSuppliers = unfilteredSuppliers.filter(function (supplier) {
                return supplier.locationId === selectedSupplier.locationId;
            });
            return foundSuppliers && foundSuppliers.length > 0 ? foundSuppliers[0] : null;
        } else {
            return null;
        }
    }

    onError = (jqXHR, textStatus, errorThrown) => {
        Busy.set(false);
        this.setState({
            unfilteredSuppliers: [],
            suppliers: [],
            infoMessage: "Suppliers failed to load!"
        });
        this.props.handleSupplierSelected(null);
        this.props.handleUnfilteredSuppliers([]);
    };

    handleEquipmentTypesFilterChange = event => {
        let equipmentTypes = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
        if (equipmentTypes) {
            let selectedCount = Object.keys(equipmentTypes).filter(key => equipmentTypes[key].value).length;

            this.setState({
                equipmentTypes: equipmentTypes,
                suppliers: Search.filterSuppliers(this.state.unfilteredSuppliers, equipmentTypes, this.state.locationFeatures),
                equipmentTypesSelectedCount: selectedCount,
            });
        }
    };

    handleLocationFeaturesFilterChange = event => {
        let locationFeatures = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if (locationFeatures) {
            let selectedCount = Object.keys(locationFeatures).filter(key => locationFeatures[key].value).length;

            this.setState({
                locationFeatures: locationFeatures,
                suppliers: Search.filterSuppliers(this.state.unfilteredSuppliers, this.state.equipmentTypes, locationFeatures),
                locationTypesSelectedCount: selectedCount,
            })

        }
    };

    static filterSuppliers(unfilteredSuppliers, searchCriteriaEquipmentTypes, searchCriteriaLocationFeatures) {
        let filteredSuppliers = [];
        if (unfilteredSuppliers) {
            for (let i = 0; i < unfilteredSuppliers.length; i++) {
                let supplier = unfilteredSuppliers[i];
                let supplierIsFiltered = false;

                Object.keys(searchCriteriaEquipmentTypes).forEach(function (key, index) {
                    if (!supplierIsFiltered) {
                        let equipmentType = searchCriteriaEquipmentTypes[key];
                        if (equipmentType.value) {
                            supplierIsFiltered = !supplier.equipmentTypes || supplier.equipmentTypes.indexOf(equipmentType.label) < 0;
                        }
                    }
                });

                if (!supplierIsFiltered) {
                    Object.keys(searchCriteriaLocationFeatures).forEach(function (key, index) {
                        if (!supplierIsFiltered) {
                            let feature = searchCriteriaLocationFeatures[key];
                            if (feature.value) {
                                supplierIsFiltered = !supplier.features || supplier.features.indexOf(feature.label) < 0;
                            }
                        }
                    });
                }

                if (!supplierIsFiltered) {
                    filteredSuppliers.push(supplier);
                }
            }
        }
        return filteredSuppliers;
    }

    toggleLiveLocations = () => {
        const liveLocations = this.state.unfilteredSuppliers.filter(supplier => supplier.visible);
        const allLocations = this.state.unfilteredSuppliers;

        if (this.state.toggleOn === false) {
            this.setState({
                suppliers: liveLocations,
                toggleOn: true
            });
        } else {
            this.setState({
                suppliers: allLocations,
                toggleOn: false
            });
        }
    }

    displayMap = () => {
        let display = true;
        if (this.state.selectedSupplier && this.state.selectedSupplier.id) {
            display = false;
        }
        if (this.state.suppliers && this.state.suppliers.length > 0) {
            display = false;
        }
        if (this.state.noSuppliersMessage) {
            display = false;
        }
        this.setState({ displayMap: display });
    };

    render() {
        return (
            <div>
                <Helmet>
                    <title>Search For A Secure Space Near You | SecurSpace</title>
                    <meta name="keywords" content="secure space parking" />
                    <meta name="description"
                        content={this.state.selectedSupplier && this.state.selectedSupplier.locationDescription
                            ? this.state.selectedSupplier.locationDescription
                            : "In need of a secure space to park your truck or trailer? We provide Search for an affordable space online today."}
                    />
                    <link rel="canonical" href={this.state.url} />
                </Helmet>

                {
                    !this.state.displayMap ?
                        <form id="searchInlineSearchForm">
                            <div id="searchSearchFields">
                                <div id="searchLocationItem" className="search-search-item hs-field">
                                    <label>LOCATION</label>
                                    <input type="text"
                                        id="searchSearchLocationName"
                                        name="searchSearchLocationName"
                                        value={this.state.searchSearchLocationName}
                                        onChange={this.handleChange}
                                        onClick={(e) => e.target.select()}
                                        placeholder="Location, 12345 USA"
                                    />
                                </div>
                                <div id="searchStartDateItem" className="search-search-item hs-field">
                                    <label>FROM</label>
                                    <input type="text"
                                        data-date-autoclose="true"
                                        id="searchSearchStartDate"
                                        name="searchSearchStartDate"
                                        value={this.state.searchSearchStartDate}
                                        placeholder="MM/DD/YYYY"
                                        readOnly
                                    />
                                </div>
                                <div id="searchEndDateItem" className="search-search-item hs-field">
                                    <label>TO</label>
                                    <input type="text"
                                        data-date-autoclose="true"
                                        id="searchSearchEndDate"
                                        name="searchSearchEndDate"
                                        value={this.state.searchSearchEndDate}
                                        placeholder="MM/DD/YYYY"
                                        readOnly
                                    />
                                </div>
                                <div className="search-search-item hs-field">
                                    <label>SPACES</label>
                                    <input type="text"
                                        id="numberOfSpaces"
                                        name="numberOfSpaces"
                                        value={this.state.numberOfSpaces}
                                        onChange={this.handleChange}
                                        onKeyPress={(event) => {
                                            if (event.keyCode === 13 || event.which === 13) {
                                                this.handleSearchValidation();
                                            }
                                        }}
                                        onClick={(e) => e.target.select()}
                                    />
                                </div>
                                <div id="searchEquipmentTypeItem"
                                    className="dropdown-multiple-select search-search-item hs-field relative">
                                    <label>EQUIPMENT TYPE</label>
                                    <input disabled
                                        className="search-number-selected"
                                        type="text"
                                        value={this.state.equipmentTypesSelectedCount > 0 ? this.state.equipmentTypesSelectedCount + ' Selected' : 'None'}
                                        onChange={this.handleChange}
                                        onClick={(e) => e.target.select()}
                                    />
                                    {this.state.equipmentTypeSelectorVisible ?
                                        <MultipleSelectCriteria
                                            type="div"
                                            name="searchCriteriaEquipmentTypes"
                                            title="EQUIPMENT TYPES"
                                            items={this.state.equipmentTypes}
                                            onChange={this.handleEquipmentTypesFilterChange}
                                            onDone={() => this.setState({ equipmentTypeSelectorVisible: false })}
                                            selectAllName="allEquipmentTypesSelected"
                                            allItemsSelected={this.state.allEquipmentTypesSelected}
                                        />
                                        :
                                        ""
                                    }
                                </div>
                                <div id="searchLocationFeaturesItems"
                                    className="dropdown-multiple-select search-search-item hs-field relative">
                                    <label>LOCATION FEATURES</label>
                                    <input disabled
                                        className="search-number-selected"
                                        type="text"
                                        value={this.state.locationTypesSelectedCount > 0 ? this.state.locationTypesSelectedCount + ' Selected' : 'None'}
                                        onChange={this.handleChange}
                                        onClick={(e) => e.target.select()}
                                    />
                                    {this.state.locationFeaturesSelectorVisible ?
                                        <MultipleSelectCriteria
                                            type="div"
                                            name="searchCriteriaEquipmentTypes"
                                            title="LOCATION FEATURES"
                                            items={this.state.locationFeatures}
                                            onChange={this.handleLocationFeaturesFilterChange}
                                            onDone={() => this.setState({ locationFeaturesSelectorVisible: false })}
                                            selectAllName="allEquipmentTypesSelected"
                                            allItemsSelected={this.state.allLocationFeaturesSelected}
                                        />
                                        :
                                        ""
                                    }
                                </div>

                                <div className="search-search-panel-button-container">
                                    <button className="orange-button search-button" type="button"
                                        onClick={this.handleSearchValidation}>
                                        SEARCH
                                    </button>
                                </div>

                                {
                                    this.props.account && this.props.account.userType === UserType.ADMIN &&
                                    <div className="live-only-button-container">
                                        <button className="live-only-button" type="button"
                                            onClick={this.toggleLiveLocations}>
                                            {this.state.toggleOn ? 'SHOW ALL LOCATIONS' : 'ONLY SHOW LIVE LOCATIONS'}
                                        </button>
                                    </div>

                                }
                            </div>
                        </form>
                        :
                        ''
                }
                <div id="ssSearch" className="flex">
                    {
                        (this.state.selectedSupplier && this.state.selectedSupplier.id) ?
                            <div id="supplierDetails">
                                <SupplierDetails account={this.props.account}
                                    supplier={this.state.selectedSupplier}
                                    recurringBooking={this.state.recurringBooking}
                                    frequencyTypeOptions={this.state.frequencyTypeOptions}
                                    selectedFrequencyType={this.state.selectedFrequencyType}
                                    selectedFrequencyTypeOption={this.state.selectedFrequencyTypeOption}
                                    startDate={this.state.searchSearchStartDate}
                                    endDate={this.state.searchSearchEndDate}
                                    numberOfSpaces={this.state.numberOfSpaces}
                                    clearErrors={this.clearErrors}
                                    onError={this.handleErrors}
                                    handleLogout={this.props.handleLogout}
                                    readSupplierPendingBooking={this.props.readSupplierPendingBooking}
                                    onClose={this.handleSupplierDetailClose}
                                    paymentMethods={this.state.paymentMethods}
                                    handleAccountChange={this.props.handleAccountChange}
                                />
                            </div>
                            :
                            (!this.state.suppliers || this.state.suppliers.length === 0) || this.state.showSearchCriteria ?
                                ""
                                :
                                <SupplierList
                                    setUrl={this.setUrl}
                                    locationName={this.state.supplierListLocationName}
                                    recurringBooking={this.state.recurringBooking}
                                    selectedFrequencyType={this.state.selectedFrequencyType}
                                    suppliers={this.state.suppliers}
                                    searchSelectedSupplier={this.state.selectedSupplier}
                                    handleSupplierSelected={this.handleSupplierSelected}
                                    onRefineSearchClick={this.showSearchCriteria}
                                    displayName={this.state.supplierListDisplayName}
                                />
                    }
                    {
                        (this.state.noSuppliersMessage) ?
                            <div className="grey-bg ss-supplier-list-container flex relative">
                                <NoSupplierList location={this.state.supplierListLocationName}
                                    displayName={this.state.supplierListDisplayName} />
                            </div>

                            :
                            ""
                    }

                    <div id="searchMap"
                        className={"w100" + (this.state.infoMessage || this.state.noSuppliersMessage ? ' visible-forced' : '')
                            + (this.state.displayMap ? ' hidden' : '')
                        }>
                        {
                            this.state.suppliers && this.state.suppliers.length > 0 ?
                                <SupplierMap account={this.props.account}
                                    location={this.state.searchedLocation}
                                    suppliers={this.state.suppliers}
                                    selectedSupplier={this.state.selectedSupplier}
                                    handleSupplierSelected={this.handleSupplierSelected}
                                />
                                :
                                null
                        }
                        {
                            (this.state.noSuppliersMessage) ?
                                <NoLocationMap location={this.state.searchedLocation} />
                                :
                                null
                        }

                        {
                            this.state.infoMessage ?
                                <div id="ss-search-result-message-container">
                                    <p className="ss-warning-box ss-large ss-as-overlay search-result-message">{this.state.infoMessage}</p>
                                </div>
                                :
                                ""
                        }
                    </div>
                    {this.state.displayMap ?

                        <USMap
                            account={this.props.account} isSearchPage={true}
                            handleSearch={this.handleSearchValidation}
                            pacSelectFirst={this.pacSelectFirst}
                            changeSearchData={this.changeSearchData}

                        />
                        :
                        null
                    }
                </div>

            </div>
        )
    }
}

export default Search;
