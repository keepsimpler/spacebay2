import Money, {} from 'js-money';


class CurrencyFormat {

    validate(value) {
        if (!value) {
            return true;
        }

        value = this.removeFormatting(value);

        return Number.isInteger(value);
    }

    removeFormatting(value) {
        if (!this.isInteger(value)) {
            value = this.removeFormatCharacters(value);
        }
        if (this.isInteger(value)) {
            //Removes any leading zeros and ensures value is an Integer
            value = parseInt(value);
        }
        return value;
    }

    removeFormatCharacters(value) {
        return value.replace("$", "").replace(".", "");
    }

    format(value) {
        if (value) {
            value = this.parse(value);
            if (this.isInteger(value)) {
                let valueMoney = new Money(parseInt(value), Money.USD, Math.round);
                value = Money.USD.symbol + valueMoney;
            }
        }
        if (value === 0 || value === "$0" || value === "$0.0" || value === "$0.00") {
            value = "";
        }
        return value;
    }

    parse(value) {
        if (!value) {
            return value;
        }

        this.removeFormatting(value);

        return value;
    }

    isInteger(x) {
        return x && (Number.isInteger(x) || (x.indexOf('.') < 0 && x % 1 === 0));
    }
}

export default CurrencyFormat;