import Money, {} from 'js-money';

const CURRENCY_US_DOLLAR = 'usd';

let PaymentUtils = {

    CURRENCY_US_DOLLAR,

    convertSmallestSubUnitToMainUnit(amountInCurrencySmallestSubUnit, currency) {
        if (!amountInCurrencySmallestSubUnit) {
            return amountInCurrencySmallestSubUnit;
        }
        if (CURRENCY_US_DOLLAR === currency) {
            return amountInCurrencySmallestSubUnit / 100;
        } else {
            throw new Error("Currency is not supported:  " + currency);
        }
    }
};

function isInteger(x) {
    return x && (Number.isInteger(x) || (x.indexOf('.') < 0 && x % 1 === 0));
}

function formatCurrencyValue(value, showZero) {
    if (value) {
        value = parseCurrencyValue(value);
        if (isInteger(value)) {
            let valueMoney = new Money(parseInt(value), Money.USD, Math.round);
            let moneyString = valueMoney.toString();
            let moneyParts = moneyString.split(".");
            value = Money.USD.symbol + moneyParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + moneyParts[1];
        }
    }
    if (value === 0 || value === "$0" || value === "$0.0" || value === "$0.00") {
        value = showZero ? "$0" : "";
    }
    if (value && value.indexOf('-') > 0) {
        value = "-" + value.replace("-", "");
    }
    return value;
}

function validateCurrencyValue(value) {
    if (!value) {
        return true;
    }

    value = removeFormatting(value);

    return Number.isInteger(value);
}

function removeFormatting(value) {
    if (!isInteger(value)) {
        value = removeFormatCharacters(value);
    }
    if (isInteger(value)) {
        //Removes any leading zeros and ensures value is an Integer
        value = parseInt(value);
    }
    return value;
}

function parseCurrencyValue(value) {
    if (value) {
        if (!isInteger(value)) {
            value = removeFormatCharacters(value);
        }
        if (isInteger(value)) {
            value = parseInt(value);
        }
    }
    return value;
}

function removeFormatCharacters(value) {
    return value.replace("$", "").replace(".", "").replace(new RegExp(",", 'g'), "");
}

function getPricePerDayFromWeeklyRate(weeklyRate) {
    weeklyRate = parseCurrencyValue(weeklyRate);
    let weeklyRateMoney = new Money(weeklyRate, Money.USD, Math.round);
    return weeklyRateMoney.divide(7, Math.round);
}

function getPricePerDayFromMonthlyRate(monthlyRate) {
    monthlyRate = parseCurrencyValue(monthlyRate);
    let monthlyRateMoney = new Money(monthlyRate, Money.USD, Math.round);
    let averageNumberOfDaysInAMonth = 30.42;
    return monthlyRateMoney.divide(averageNumberOfDaysInAMonth, Math.round);
}

export {
    PaymentUtils as default,
    getPricePerDayFromWeeklyRate,
    getPricePerDayFromMonthlyRate,
    formatCurrencyValue,
    parseCurrencyValue,
    validateCurrencyValue
};