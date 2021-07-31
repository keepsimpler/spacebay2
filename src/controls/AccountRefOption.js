import Option from "./Option";

class AccountRefOption extends Option {

    constructor(accountRef, showEmail) {
        super(accountRef.id);
        if (showEmail) {
            this.displayValue = accountRef.companyName + ' - ' + accountRef.email;
        } else {
            this.displayValue = accountRef.companyName;
        }
    }

    getDisplayValue() {
        return this.displayValue;
    }
}

export {AccountRefOption};
