import React, { Component } from 'react'
import { AppContext } from "../../context/app-context"
import Search from "../../views/Search"
import SearchUtilService from "../../services/search/SearchUtilService";


class ContextualSearch extends Component {
    static contextType = AppContext

    constructor(props) {
        super(props);

        this.state = SearchUtilService.getDefaultSearchContext()
    }

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
        numberOfSpaces,
        equipmentTypes,
        locationFeatures
    ) => {

        let locationDeselectedUpdates = {}

        if (!location || location !== this.state.searchLocation) {
            locationDeselectedUpdates = {
                selectedSupplier: null,
                unfilteredSuppliers: []
            }
        }

        const baseUpdates = {
            searchLocation: location,
            searchLocationName: locationName,
            searchLocationCityState: locationCityState,
            recurringBooking: recurringBooking,
            frequencyTypeOptions: frequencyTypeOptions,
            selectedFrequencyType: selectedFrequencyType,
            selectedFrequencyTypeOption: selectedFrequencyTypeOption,
            searchStartDate: startDate,
            searchEndDate: endDate,
            searchNumberOfSpaces: numberOfSpaces,
            searchEquipmentTypes: equipmentTypes,
            searchLocationFeatures: locationFeatures
        }

        this.setState({
            ...baseUpdates,
            locationDeselectedUpdates
        })
    }

    handleEquipmentTypesFilterChange = equipmentTypes => {
        this.setState({
            searchEquipmentTypes: equipmentTypes
        })
    }

    handleLocationFeaturesFilterChange = locationFeatures => {
        this.setState({
            searchLocationFeatures: locationFeatures
        })
    }

    handleSupplierSelected = selectedSupplier => {
        this.setState({
            selectedSupplier
        })

    }

    handleUnfilteredSuppliers = unfilteredSuppliers => {
        this.setState({
            unfilteredSuppliers
        })
    }

    render() {
        const appContext = this.context
        const { user, clearUser, updateUser } = appContext
        const { readSupplierPendingBooking } = this.props
        return (
            <Search
                account={user}
                handleLogout={clearUser} // todo za -- remove this
                readSupplierPendingBooking={readSupplierPendingBooking}
                handleAccountChange={updateUser}
                handleSearch={this.handleSearch}
                handleEquipmentTypesFilterChange={this.handleEquipmentTypesFilterChange}
                handleLocationFeaturesFilterChange={this.handleLocationFeaturesFilterChange}
                handleSupplierSelected={this.handleSupplierSelected}
                handleUnfilteredSuppliers={this.handleUnfilteredSuppliers}
                location={this.state.searchLocation}
                locationName={this.state.searchLocationName}
                locationCityState={this.state.searchLocationCityState}
                recurringBooking={this.state.recurringBooking}
                frequencyTypeOptions={this.state.frequencyTypeOptions}
                selectedFrequencyType={this.state.selectedFrequencyType}
                selectedFrequencyTypeOption={this.state.selectedFrequencyTypeOption}
                startDate={this.state.searchStartDate}
                endDate={this.state.searchEndDate}
                numberOfSpaces={this.state.searchNumberOfSpaces}
                equipmentTypes={this.state.searchEquipmentTypes}
                locationFeatures={this.state.searchLocationFeatures}
                selectedSupplier={this.state.selectedSupplier}
                unfilteredSuppliers={this.state.unfilteredSuppliers}
            />
        )
    }
}

export default ContextualSearch
