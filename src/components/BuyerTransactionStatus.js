

const notApproved = [
    "PAYMENT_NOT_SUBMITTED",
    "PAYMENT_AUTHORIZED"
];

const chargePending = [
    "CHARGE_PENDING"
];

const incomplete = [
    "BOOKING_INCOMPLETE"
];

const paymentPending = [
    "PAYMENT_PENDING"
];

const paymentFailed = [
    "PAYMENT_FAILED"
];

const bookingDeclined = [
    "PAYMENT_CANCELLED"
];


const paymentSucceeded = [
    "PAYMENT_SUCCEEDED",
    "SECURSPACE_PAYOUT_PENDING",
    "SUPPLIER_PAYOUT_PENDING",
    "SUPPLIER_PAYOUT_PENDING_SECURSPACE_FEE_PAYOUT_FAILED",
    "SUPPLIER_PAYOUT_SUCCEEDED",
    "SUPPLIER_PAYOUT_SUCCEEDED_SECURSPACE_FEE_PAYOUT_FAILED",
    "SECURSPACE_PAYOUT_FAILED",
    "SECURSPACE_PAYOUT_CANCELED",
    "SUPPLIER_PAYOUT_ON_HOLD",
    "SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_PENDING",
    "SUPPLIER_PAYOUT_FAILED_SECURSPACE_FEE_PAYOUT_SUCCEEDED",
    "SUPPLIER_PAYOUT_FAILED",
    "SECURSPACE_PAYOUT_SUCCEEDED"
];

let getDisplayValue = (value) => {
    if (notApproved.includes(value)) {
        return "Approval Pending"
    } else if (chargePending.includes(value)) {
        return "Charge Pending";
    } else if (incomplete.includes(value)) {
        return "Booking Incomplete";
    } else if (paymentPending.includes(value)) {
        return "Payment Pending";
    } else if (paymentFailed.includes(value)) {
        return "Payment Failed";
    } else if (bookingDeclined.includes(value)) {
        return "Booking Declined";
    } else if (paymentSucceeded.includes(value)) {
        return "Complete";
    } else {
        return value;
    }
};

export default getDisplayValue;