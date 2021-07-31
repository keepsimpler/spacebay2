import EquipmentTypes from "../../components/EquipmentTypes";
import LocationFeatures from "../../components/LocationFeatures";
import { FREQUENCY_TYPE_MONTHLY, FrequencyOptions } from "../../controls/FrequencyOption";

class SearchUtilService {
    static getDefaultSearchContext = () => {
        const defaultStartDate = SearchUtilService.getFromDateTimeDefault(0)
        return {
            recurringBooking: false,
            frequencyTypeOptions: new FrequencyOptions(defaultStartDate).createOptions(FREQUENCY_TYPE_MONTHLY),
            selectedFrequencyType: FREQUENCY_TYPE_MONTHLY,
            selectedFrequencyTypeOption: "",
            searchStartDate: defaultStartDate,
            searchEndDate: SearchUtilService.getFromDateTimeDefault(1),
            searchNumberOfSpaces: "1",
            searchLocation: null,
            searchLocationName: '',
            searchEquipmentTypes: SearchUtilService.createLocationItemList(EquipmentTypes.OPTIONS, "searchEquipmentType"),
            searchLocationFeatures: SearchUtilService.createLocationItemList(LocationFeatures.OPTIONS, "searchLocationFeatures"),
            selectedSupplier: null,
            unfilteredSuppliers: [],
        }
    }

    static getDefaultLandingSearchContext = () => {
        const defaultStartDate = SearchUtilService.getFromDateTimeDefault(0)

        return {
            landingSearchLocation: '',
            landingSearchLocationCityState: '',
            landingSearchStartDate: defaultStartDate,
            landingSearchEndDate: SearchUtilService.getFromDateTimeDefault(1),
            landingSearchNumberOfSpaces: "1",
            location: null
        }
    }

    static getFromDateTimeDefault = (daysToAdd) => {
        let date = new Date();
        date.setDate(date.getDate() + daysToAdd);

        let dd = date.getDate();
        let mm = date.getMonth() + 1;
        let yyyy = date.getFullYear();

        return mm + '/' + dd + '/' + yyyy;
    }

    static createLocationItemList = (locationItemLabels, locationItemType) => {
        let items = {};
        for (let index = 0; index < locationItemLabels.length; index++) {
            let itemLabel = locationItemLabels[index];
            items[locationItemType + index] = {
                label: itemLabel,
                value: false
            };
        }
        return items;
    }
}

export default SearchUtilService
