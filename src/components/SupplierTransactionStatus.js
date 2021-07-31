const notApproved = [
    "PAYMENT_AUTHORIZED",
    "PAYMENT_NOT_SUBMITTED"
];

const bookingDeclined = [
    "PAYMENT_CANCELLED"
];

const chargePending = [
    "CHARGE_PENDING"
];

const incomplete = [
    "BOOKING_INCOMPLETE"
];

const paymentPending = [
    "PAYMENT_PENDING",
    "PAYMENT_SUCCEEDED",
    "SECURSPACE_PAYOUT_PENDING"
];

const paymentFailed = [
    "PAYMENT_FAILED",
    "SECURSPACE_PAYOUT_FAILED",
    "SECURSPACE_PAYOUT_CANCELED"
];

const payoutReady = [
    "SECURSPACE_PAYOUT_SUCCEEDED"
];

const payoutPending = [
    "SUPPLIER_PAYOUT_PENDING",
    "SUPPLIER_PAYOUT_PENDING_SECURSPACE_FEE_PAYOUT_FAILED",
];

const payoutFailed = [
    "SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_PENDING",
    "SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED",
    "SUPPLIER_PAYOUT_FAILED"
];

const payoutOnHold = [
    "SUPPLIER_PAYOUT_ON_HOLD"
];

const payoutSucceeded = [
    "SUPPLIER_PAYOUT_SUCCEEDED",
    "SUPPLIER_PAYOUT_SUCCEEDED_SECURSPACE_FEE_PAYOUT_FAILED"
];



let getDisplayValue = (value) => {

    if (notApproved.includes(value)) {
        return "Approval Pending"
    } else if (bookingDeclined.includes(value)) {
        return "Booking Declined"
    } else if (chargePending.includes(value)) {
        return "Charge Pending";
    } else if (incomplete.includes(value)) {
        return "Incomplete";
    } else if (paymentPending.includes(value)) {
        return "Payment Pending";
    } else if (paymentFailed.includes(value)) {
        return "Payment Failed";
    } else if (payoutReady.includes(value)) {
        return "Payout Ready";
    } else if (payoutPending.includes(value)) {
        return "Payout Pending";
    } else if (payoutFailed.includes(value)) {
        return "Payout Failed";
    } else if (payoutOnHold.includes(value)) {
        return "Payout On Hold";
    } else if (payoutSucceeded.includes(value)) {
        return "Complete";
    } else {
        return value;
    }
};

export default getDisplayValue;