import Option from "./Option";
import OptionType from "./OptionType";

/* eslint-disable */

const DAY_OF_WEEK_SUNDAY = 0;
const DAY_OF_WEEK_MONDAY = 1;
const DAY_OF_WEEK_TUESDAY = 2;
const DAY_OF_WEEK_WEDNESDAY = 3;
const DAY_OF_WEEK_THURSDAY = 4;
const DAY_OF_WEEK_FRIDAY = 5;
const DAY_OF_WEEK_SATURDAY = 6;

/* eslint-enable */

class FrequencyType extends OptionType {

    constructor(name, value, nounDesc, maxNumberOfRecurrences, getEndDate) {
        super(name);
        this.value = value;
        this.nounDesc = nounDesc;
        this.maxNumberOfRecurrences = maxNumberOfRecurrences;
        this.getEndDate = getEndDate;
    }
}

class FrequencyOption extends Option {

    constructor(startDate, occurrence, frequencyType) {
        super(occurrence);
        this.startDate = startDate;
        this.frequencyType = frequencyType;
        this.endDate = frequencyType.getEndDate(this.startDate, occurrence);
        this.formattedEndDate = formatDate(this.endDate);
        this.displayValue = occurrence + " - " + this.formattedEndDate;
    }

    recreatedFromStartDate(startDate) {
        return new FrequencyOption(startDate, this.value, this.frequencyType);
    }

    getDisplayValue() {
        return this.displayValue;
    }

    getNounDesc() {
        return this.nounDesc;
    }

    getEndDate() {
        return this.endDate;
    }

    getFormattedEndDate() {
        return this.formattedEndDate;
    }

    getFrequencyType() {
        return this.frequencyType;
    }
}

class FrequencyOptions {

    constructor(startDate) {
        this.startDate = startDate;

    }

    createOptions(frequencyType, maxNumberOfIterations, startWithZero) {
        maxNumberOfIterations = maxNumberOfIterations ? maxNumberOfIterations : frequencyType.maxNumberOfRecurrences;
        return Array.from({length: maxNumberOfIterations}, (v, i) => new FrequencyOption(this.startDate, startWithZero ? i : i + 1, frequencyType));
    }
}

function getEndDateWeekly(startDate, numberOfWeeks) {
    let dayOfWeek = new Date(startDate).getDay();
    if (dayOfWeek === DAY_OF_WEEK_MONDAY) {
        //Only do this if the startDate is the first day of the billing week because the current week counts toward the numberOfWeeks given
        numberOfWeeks--;
    }

    let sundayAfterStartDate = getSundayAfter(startDate);
    return addDaysToDate(sundayAfterStartDate, 7 * numberOfWeeks);
}

function getSundayAfter(date) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + (7 - newDate.getDay()) % 7);
    return newDate;
}

function addDaysToDate(date, numberOfDaysToAdd){
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numberOfDaysToAdd);
    return newDate;
}

function getEndDateMonthly(startDate, numberOfMonths) {
    let dayOfMonth = new Date(startDate).getDate();
    if (dayOfMonth === 1) {
        //Only do this if the startDate is the first day of the month because the current month counts toward the numberOfMonths given
        numberOfMonths--;
    }

    let newDate = new Date(startDate);
    let thisMonth = newDate.getMonth();
    let endDateMonth = thisMonth + numberOfMonths;
    let endDateYear = newDate.getFullYear();
    if (endDateMonth >= 12) {
        let adjustedMonth = endDateMonth % 12;
        let yearsToAdd = (endDateMonth - adjustedMonth) / 12;
        endDateMonth = adjustedMonth;
        endDateYear = newDate.getFullYear() + yearsToAdd;
    }
    return new Date(endDateYear, endDateMonth + 1, 0);
}

function formatDate(date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    let yyyy = date.getFullYear();

    return mm + '/' + dd + '/'+ yyyy;
}

const FREQUENCY_TYPE_WEEKLY = new FrequencyType("Weekly", "WEEKLY", "Week", 52, getEndDateWeekly);
const FREQUENCY_TYPE_MONTHLY = new FrequencyType("Monthly", "MONTHLY", "Month", 12, getEndDateMonthly);

const FREQUENCY_TYPES = [FREQUENCY_TYPE_WEEKLY, FREQUENCY_TYPE_MONTHLY];

export {FrequencyOption, FrequencyOptions, FREQUENCY_TYPE_MONTHLY, FREQUENCY_TYPE_WEEKLY, FREQUENCY_TYPES};
