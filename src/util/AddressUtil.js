
function createLocationFromAddress(account) {
    let lookupLocation = '';
    if (account.addressLine1) {
        lookupLocation = account.addressLine1 && account.addressLine1.trim() ? account.addressLine1 + ', ' : '';
    }
    if (account.city) {
        lookupLocation = lookupLocation + (account.city && account.city.trim() ? account.city + ', ' : '');
    }
    if (account.state) {
        lookupLocation = lookupLocation + (account.state && account.state.trim() ? account.state + ' ' : '');
    }
    if (account.zip) {
        lookupLocation = lookupLocation + (account.zip && account.zip.trim() ? account.zip : '');
    }
    if (lookupLocation && lookupLocation.substring(lookupLocation.length - 1, lookupLocation.length) === " ") {
        lookupLocation = lookupLocation.substring(0, lookupLocation.length - 1);
    }
    if (lookupLocation && lookupLocation.substring(lookupLocation.length - 2, lookupLocation.length) === ", ") {
        lookupLocation = lookupLocation.substring(0, lookupLocation.length - 2);
    }
    if (lookupLocation) {
        lookupLocation = lookupLocation + ', USA'
    }
    return lookupLocation;
}

export {createLocationFromAddress};