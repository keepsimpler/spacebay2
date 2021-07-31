import '../css/components/searchCriteria.css';
import "../css/components/closeIcon.css";
import {FrequencyOptions} from "../controls/FrequencyOption";

class SearchUtils {

    static getUpdatedRecurringProperties(startDate, recurringBooking, selectedFrequencyType, selectedFrequencyTypeOption) {
        if (recurringBooking) {
            let frequencyOptions = new FrequencyOptions(startDate);
            let frequencyTypeOptions = frequencyOptions.createOptions(selectedFrequencyType);
            let updatedSelectedFrequencyTypeOption;
            if (selectedFrequencyTypeOption && selectedFrequencyTypeOption.getFrequencyType() === selectedFrequencyType) {
                updatedSelectedFrequencyTypeOption = selectedFrequencyTypeOption.recreatedFromStartDate(startDate);
            } else {
                updatedSelectedFrequencyTypeOption = frequencyTypeOptions[0];
            }
            return {
                frequencyTypeOptions: frequencyTypeOptions,
                selectedFrequencyTypeOption: updatedSelectedFrequencyTypeOption,
                searchCriteriaEndDate: updatedSelectedFrequencyTypeOption.getFormattedEndDate()
            };
        } else {
            return {
                frequencyTypeOptions: [],
                selectedFrequencyTypeOption: ""
            }
        }
    }

    static getLocation(location) {
        let locationGeometry = location ? location.geometry : null;
        return locationGeometry ? locationGeometry.location : null;
    }

    static isInteger(x) {
        return x % 1 === 0;
    }
}

export {SearchUtils};
