const checkDigitConversions = {
    'A': 10,
    'B': 12,
    'C': 13,
    'D': 14,
    'E': 15,
    'F': 16,
    'G': 17,
    'H': 18,
    'I': 19,
    'J': 20,
    'K': 21,
    'L': 23,
    'M': 24,
    'N': 25,
    'O': 26,
    'P': 27,
    'Q': 28,
    'R': 29,
    'S': 30,
    'T': 31,
    'U': 32,
    'V': 34,
    'W': 35,
    'X': 36,
    'Y': 37,
    'Z': 38
};

const allLettersRegex = /^[a-z]+$/i;
const allNumbersRegex = /^[0-9]+$/i;


function validateContainerNumber(containerNumber) {

    if(!containerNumber) {
        return false
    }

    containerNumber = containerNumber.toUpperCase();

    //Valid container numbers are 11 digits long.
    if (containerNumber.length !== 11) {
        return false;
    }

    let companyCode = containerNumber.substring(0, 3);
    let productCode = containerNumber.substring(3, 4);
    let serialNumber = containerNumber.substring(4, 10);
    let checkDigit = containerNumber.substring(10);

    let isValid = true;

    //Company Code is all letters
    if (!allLettersRegex.test(companyCode)) {
        return false;
    }

    //Product code is all letters
    if (productCode !== 'U') {
        return false;
    }

    //Serial number is all numbers
    if (!allNumbersRegex.test(serialNumber)) {
        return false;
    }

    //Check Digit is all numbers
    if (!allNumbersRegex.test(checkDigit)) {
        return false;
    }

    let calculatedCheckDigit = calculateCheckDigit(companyCode, productCode, serialNumber);

    if (calculatedCheckDigit !== parseInt(checkDigit)) {
        return false;
    }

    return isValid;
}

function calculateCheckDigit(companyCode, productCode, serialNumber) {

    let companyCodeCalc = companyCode.split('').map((x) => checkDigitConversions[x]);
    let productCodeCalc = productCode.split('').map((x) => checkDigitConversions[x]);
    let serialNumberCalc = serialNumber.split('').map((x) => parseInt(x));

    let sumOfDigits = companyCodeCalc
        .concat(productCodeCalc)
        .concat(serialNumberCalc)
        .map((x, index) => Math.pow(2, index) * x)
        .reduce((total, x) => total + x);

    let diffCalc = sumOfDigits / 11;
    diffCalc = Math.floor(diffCalc);
    diffCalc *= 11;

    return sumOfDigits - diffCalc;
}

export {calculateCheckDigit, validateContainerNumber};
