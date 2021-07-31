import Option from "./Option";

class ReferenceOption extends Option {

    constructor(referenceKey, displayValue) {
        super(referenceKey);
        this.displayValue = displayValue;
    }

    getValue() {
        return this.value;
    }

    getDisplayValue() {
        return this.displayValue;
    }
}

export default ReferenceOption;