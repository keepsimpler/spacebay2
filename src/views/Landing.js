import React, {Component, useContext} from 'react';
import {Link} from 'react-router-dom';
import '../css/views/landing.css';
import RedirectToSearch from "../components/RedirectToSearch";
import USMap from "../components/USMap";
import Testimonials from "../components/Testimonials";
import TopTier from "../components/TopTier";
import {Helmet} from "react-helmet";
import Search from "./Search";
import { GlobalModalContext } from "../context/global-modal-context";
import { AppContext } from "../context/app-context";
import { useHistory } from "react-router";
import { getLandingRedirectPathForUser } from "../routing/route-utils";
import SearchUtilService from "../services/search/SearchUtilService";
import SearchQueryStringBuilder from "../services/search/SearchQueryStringBuilder";
import PropTypes from 'prop-types'

const $ = window.$;
const google = window.google;

class Landing extends Component {
    static contextType = GlobalModalContext

    static propTypes = {
        user: PropTypes.object,
        showSignUpModal: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            ...SearchUtilService.getDefaultLandingSearchContext(),
            navToSearch: false,
            url: window.location.href
        };

        this.benefitsList = [
            {
                "title": "Find The Right Fit",
                "text": "Search for available parking and storage space with the security, visibility and access that " +
                "meets your needs.",
                "icon":"../app-images/landing/icon1.png"
            },
            {
                "title": "Flexible Arrangements",
                "text": " Reserve and pay only for the capacity you need; no more long term commitments.",
                "icon":"../app-images/landing/icon2.png"
            },
            {
                "title": " Growing National Network",
                "text": "Access a growing network of locations in every major transportation hub.",
                "icon":"../app-images/landing/icon3.png"
            }
        ];
    }

    componentDidMount() {


        this.initDatePickers();
        let locationInputs = document.getElementsByName('landingSearchLocationName');
        for (let i = 0; i < locationInputs.length; i++) {
            this.pacSelectFirst(locationInputs[i]);
            this.addAutocompleteListener(locationInputs[i]);
        }
    }

    addAutocompleteListener(locationInput) {
        let _this = this;
        const options = {
            types: ['(cities)']
        };
        const autocomplete = new window.google.maps.places.Autocomplete(locationInput, options);
        autocomplete.addListener('place_changed', function () {
            let place = autocomplete.getPlace();
            let addressParts = Search.getAddressParts(place);
            let foundLocation = Landing.getLocation(place);
            if (foundLocation) {
                _this.setState({
                    landingSearchLocationName: place.formatted_address,
                    landingSearchLocationCityState: addressParts.cityState,
                    location: foundLocation
                });
            } else {
                _this.setState({location: null});
            }
        });
    }

    pacSelectFirst(input) {
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
                            _this.handleSearch();
                        }
                    }

                    orig_listener.apply(input, [event]);
                };
            }

            _addEventListener.apply(input, [type, listener]);
        }

        input.addEventListener = addEventListenerWrapper;
        input.attachEvent = addEventListenerWrapper;
    }

    static getLocation(place) {
        let locationGeometry = place ? place.geometry : null;
        return locationGeometry ? locationGeometry.location : null;
    }

    initDatePickers() {
        $('#landingSearchStartDate').datepicker({
            format: 'm/d/yyyy',
            startDate: new Date()
        }).on('changeDate', this.handleChange);
        $('#landingSearchEndDate').datepicker({
            format: 'm/d/yyyy',
            startDate: new Date()
        }).on('changeDate', this.handleChange);
        $('#landingInlineSearchDatesFieldset').datepicker({
            inputs: $('#landingSearchStartDate, #landingSearchEndDate')
        });

    }

    handleChange = event => {
        let id = event.target.id;
        let name = event.target.name;
        let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
        if ('landingSearchNumberOfSpaces' === name && value && (!Landing.isInteger(value) || value <= 0 || value > 9999)) {
            return;
        }
        if ('landingSearchLocationName' === name) {
            this.setState({location: null});
        }
        if ('landingSearchStartDate' === id) {
            $('#landingSearchEndDate').focus();
        }
        this.setState({[name]: value});
    };

    static isInteger(x) {
        return x % 1 === 0;
    }

    handleSearch = () => {
        //If a search is performed when the Number Of Spaces field is empty, just default it to 1
        let numberOfSpaces = this.state.landingSearchNumberOfSpaces ? this.state.landingSearchNumberOfSpaces : 1;
        this.setState({
            navToSearch: true,
            landingSearchNumberOfSpaces: numberOfSpaces
        })
    }

    generateSearchQueryString = () => {
        const {
            landingSearchStartDate: startDate,
            landingSearchEndDate: endDate,
            landingSearchNumberOfSpaces: numSpaces,
            location
        } = this.state

        return new SearchQueryStringBuilder()
            .setStartDate(startDate)
            .setEndDate(endDate)
            .setNumberOfSpaces(numSpaces)
            .setLat((location || { lat: () => {}}).lat())
            .setLong((location || { lng: () => {}}).lng())
            .build()
    }

    handleGetStartedClick = () => {
        const { user, showSignUpModal, history } = this.props
        if(user && user.id) {
            history.push(getLandingRedirectPathForUser(user))
        } else {
            showSignUpModal()
        }
    }

    render() {
        $(document).delegate('.trigger-click', 'click', function () {
            let element = $(this).find('input');
            $(element[0]).focus();
        });

        return (
            <div id="ssLanding" className="ss-main ss-horizontal">
                <Helmet>
                    <title>SecurSpace | Nationwide Truck Parking & Storage</title>
                    <meta name="keywords" content="truck parking" />
                    <meta name="description"
                          content="SecurSpace is an online marketplace that connects companies looking for parking and storage options to those with excess capacity." />
                    <link rel="canonical" href={this.state.url} />
                </Helmet>

                <RedirectToSearch navToSearch={this.state.navToSearch}/>
                <header>
                    <h1 className="page-title">On-Demand Access to Yard Space</h1>
                    <h3>It's simple and secure</h3>
                    <form id="landingInlineSearchForm">
                        <div>
                            <div className="trigger-click hs-field">
                                <label>LOCATION</label>
                                <input type="text"
                                       id="landingSearchLocationName"
                                       name="landingSearchLocationName"
                                       value={this.state.landingSearchLocationName}
                                       onChange={this.handleChange}
                                       onClick={(e) => e.target.select()}
                                       placeholder="Location, 12345 USA"
                                />
                            </div>


                            <div className="trigger-click hs-field">
                                <label>FROM</label>
                                <input type="text"
                                       data-date-autoclose="true"
                                       id="landingSearchStartDate"
                                       name="landingSearchStartDate"
                                       value={this.state.landingSearchStartDate}
                                       placeholder="MM/DD/YYYY"
                                       readOnly
                                />
                            </div>

                            <div className="trigger-click hs-field">
                                <label>TO</label>
                                <input type="text"
                                       data-date-autoclose="true"
                                       id="landingSearchEndDate"
                                       name="landingSearchEndDate"
                                       value={this.state.landingSearchEndDate}
                                       placeholder="MM/DD/YYYY"
                                       readOnly
                                />
                            </div>

                            <div className="trigger-click hs-field">
                                <label>SPACES</label>
                                <input type="text"
                                       id="landingSearchNumberOfSpaces"
                                       name="landingSearchNumberOfSpaces"
                                       value={this.state.landingSearchNumberOfSpaces}
                                       onChange={this.handleChange}
                                       onKeyPress={(event) => {
                                           if (event.keyCode === 13 || event.which === 13) {
                                               this.handleSearch();
                                           }
                                       }}
                                       onClick={(e) => e.target.select()}
                                />
                            </div>
                            <div>
                                <Link to={`/search?${this.generateSearchQueryString()}`}>
                                    <button type="button" onClick={() => {}}>
                                        Search
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </form>
                </header>


                <div id="benefits-panel">
                    {
                        this.benefitsList.map((item,index)=>
                            <div className="benefits-panel-item col-lg-4 col-md-4 col-sm-12 col-xs-12" key={index}>
                                <img alt="" src={item.icon} />
                                <div className="benefits-panel-item-label">
                                    {item.title}
                                </div>
                                <div className="benefits-panel-item-text">
                                    {item.text}
                                </div>
                            </div>
                        )
                    }
                    <div className="clear"/>
                </div>

                <USMap account={this.props.account}/>

                <div id="landing-adding-partners-panel">
                    <div id="landing-adding-partners-panel-text-block">
                        <div className="section-title">
                            SecūrSpace is adding new partners across the country
                        </div>
                        <div id="landing-adding-partners-panel-text">
                            Find out how you can monetize your extra parking and storage space today.
                        </div>
                        <br/>
                        <br/>
                        <span onClick={()=>{
                            this.handleGetStartedClick()
                        }}>
                            <div className="orange-button">
                                GET STARTED
                            </div>
                        </span>
                    </div>
                </div>
                <TopTier/>
                <Testimonials/>

            </div>
        )
    }
}

const ContextualLandingWrapper = (props) => {
    const appContext = useContext(AppContext)
    const { user } = appContext

    const globalModalContext = useContext(GlobalModalContext)
    const { showSignUpModal } = globalModalContext

    const history = useHistory()

    return (
        <Landing
            { ...props }
            user={user}
            showSignUpModal={showSignUpModal}
            history={history}
        />
    )
}

export default ContextualLandingWrapper;
