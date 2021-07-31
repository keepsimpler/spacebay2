import React, {Component} from 'react';
import '../css/views/locationsProfile.css';
import '../css/theme/mainContent.css';
import '../css/theme/forms.css';
import '../css/theme/forms-block.css';
import '../css/theme/buttons.css';

import LocationListing from '../components/LocationListing.js';
import { AppContext } from "../context/app-context";
import CreateEditLocationsModalWrapper from "../components/modals/modal-wrappers/CreateEditLocationsModalWrapper";
import {createLogoutOnFailureHandler} from '../util/LogoutUtil'
import Busy from "../components/Busy";
import {toast} from "react-toastify";

const $ = window.$;

class LocationsProfile extends Component {

    static contextType = AppContext

    constructor(props, context) {
        super(props, context);

        const appContext = this.context
        const { user } = appContext

        this.state = {
            accountId: user.id,
            showHelp: 1,
            globalLocations: [],
            locationToEdit: null,
            selectedSupplier: null,
            createEditModalOpen: false
        };
    }

    handleEditLocation = (location) => {
        this.setState({locationToEdit: location})
    }

    handleSelectedSupplier = (selectedSupplier) => {
        this.setState({selectedSupplier})
    }

    setModalVisibility = (visible: boolean) => {
        this.setState({createEditModalOpen: visible})
    }

    openCreateEditModal = () => {
        this.setModalVisibility(true)
    }

    hideCreateEditModal = () => {
        this.setModalVisibility(false)
    }

    handleCreateNewClick = () => {
        this.setState({
            locationToEdit: null,
            createEditModalOpen: true
        })
    }

    componentDidMount() {
        if (this.bxslider) {
            this.bxslider.destroySlider();
        }
        this.startSlider();
        this.fetchLocations();
        $('html,body').scrollTop(0);
    }

    fetchLocations() {
        const appContext = this.context
        const { logout } = appContext
        Busy.set(true);
        $.ajax({
            url: 'api/location',
            type: 'GET',
            success: this.fetchLocationsSuccess,
            statusCode: {
                401: createLogoutOnFailureHandler(logout)
            },
            error: this.fetchLocationsFailure,
            complete: function(){
            }
        });
    }

    fetchLocationsSuccess = data => {
        Busy.set(false);
        this.setState({
            globalLocations: data ? data : []
        });
    };

    fetchLocationsFailure = (jqXHR) => {
        Busy.set(false);
        if (jqXHR.status === 401) {
            return;
        }
        this.setState({
            globalLocations: []
        });
        toast.error(LocationsProfile.getErrorMessage(jqXHR));
    };

    static getErrorMessage(jqXHR) {
        let jsonErrorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : null
        let trimmedJsonErrorMessage = jsonErrorMessage ? jsonErrorMessage.split(' ').join('') : null;
        return trimmedJsonErrorMessage ? trimmedJsonErrorMessage : "Internal Server Error";
    }

    handleDeleteLocationSuccess = location => {
        let locations = this.state.globalLocations;
        for (let i = 0; i < locations.length; i++) {
            if (locations[i] === location) {
                locations.splice(i, 1);
            }
        }
        Busy.set(false);
        this.setState({
            globalLocations: locations
        });
        toast.success('Successfully deleted ' + location.locationName + ' from locations!');
    };

    handleDeleteLocationFailure = errorMessage => {
        Busy.set(false);
        toast.error('Failed to delete location.  Reason:  ' + errorMessage);
    };

    updateEditLocation = location => {
        let locations = this.state.globalLocations;
        let found= false;
        for (let i = 0; i < locations.length; i++) {
            if (locations[i].id === location.id) {
                locations[i]=location;
                found = true;
                break;
            }
        }

        if(!found){
            this.state.globalLocations.push(location);
        }
    };

    startSlider = () => {
        let numberOfVisibleSlides, sliderMargin;
        let windowWidth = $(window).width();
        let w = $('.info-details').width();

        if (windowWidth < 1000) {
            numberOfVisibleSlides = 1;
            sliderMargin = 20;

            this.bxslider = $('.info-details ul').bxSlider({
                auto: false,
                responsive: false,
                infiniteLoop: true,
                pager: false,
                preventDefaultSwipeY: true,
                speed: 500,
                minSlides: numberOfVisibleSlides,
                maxSlides: numberOfVisibleSlides,
                moveSlides: 1,
                slideWidth: Math.ceil(w / numberOfVisibleSlides),
                slideMargin: sliderMargin
            });
        }
    };

    render() {

        const appContext = this.context
        const { user, logout } = appContext

        return (
            <div id="ssLocationsProfile" className="grey-bg hs-bookings-container h-100">
                <div>
                    <header>
                        <ul className="breadcrumb">
                            <li>Account</li>
                            <li>Manage Locations</li>
                        </ul>
                        <h1 className="content-header-title">Manage Locations</h1>
                    </header>

                    <div>

                        {this.state.showHelp ?
                            <div className="info-locations relative">
                                <span className="close"
                                      onClick={() => this.setState({showHelp: 0})}
                                ><i className="fa fa-close" /> </span>
                                <div className="info-details">
                                    <div className="large-screen">
                                    <span>
                                        Things to know<br/>
                                        about Locations
                                    </span>
                                    </div>
                                    <div className="ul-container">
                                        <ul>
                                            <li className="search-image">
                                                <span>Locations allow Customers to <b>find your facilities</b> on the
                                                    SecurSpace Search screen.</span>
                                            </li>
                                            <li className="location-image">
                                                <span>Locations are <b>required to have basic info</b> specified
                                                    before they appear in search results.</span>
                                            </li>
                                            <li className="list-image">
                                                <span>The "Search Status" of a location lets you know if they are
                                                    ready to <b>appear in search results</b></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            :
                            null}

                        <h2 className="float-left">My locations</h2>

                        <div className="w100 pull-left">
                            <div className="text-right">
                                    <button type="button"
                                            onClick={() => this.handleCreateNewClick()}
                                            className="ss-button-secondary">
                                        {this.state.globalLocations && this.state.globalLocations.length > 0 ?
                                            "Create Another Location"
                                            :
                                            "Create Location"
                                        }
                                    </button>
                            </div>
                            {
                                this.state.globalLocations.map((location, index) =>
                                    <LocationListing key={index}
                                                     handleEditLocation={this.handleEditLocation}
                                                     updateEditLocation={this.updateEditLocation}
                                                     handleDeleteLocationSuccess={this.handleDeleteLocationSuccess}
                                                     handleDeleteLocationFailure={this.handleDeleteLocationFailure}
                                                     handleLogout={logout}
                                                     location={location}
                                                     account={user}
                                                     handleSupplierSelected={this.handleSelectedSupplier}
                                                     openEditModal={this.openCreateEditModal}
                                    />
                                )
                            }

                        </div>
                        <div className='ss-supplier-active-bookings-endlist'>
                            <h6>You have reached the end of the list</h6>
                        </div>
                    </div>

                </div>

                {
                    this.state.createEditModalOpen &&
                    <CreateEditLocationsModalWrapper
                        closeModal={this.hideCreateEditModal}
                        updateEditLocation={this.updateEditLocation}
                        locationToEdit={this.state.locationToEdit}
                    />
                }
            </div>
        )
    }
}

export default LocationsProfile;
