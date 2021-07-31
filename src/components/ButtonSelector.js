import React, {Component} from 'react';
import '../css/theme/buttons.css';
import '../css/components/buttonSelector.css';

class ButtonSelector extends Component {
    buttonStyle = () => {
        return {
            marginTop: "14px",
            width: this.props.buttonWidth,
            height: this.props.buttonHeight,
            paddingTop: "1.2px",
            fontSize: "14px"
        };
    };

    getOptionName(option) {
        return (option && option.hasOwnProperty("name")) ? option.name : option;
    }

    optionsEqual(option1, option2) {
        return this.getOptionName(option1) === this.getOptionName(option2);
    }

    optionClassName = (option, optionIndex) => {
        let firstOption = optionIndex === 0;
        let lastOption = optionIndex === this.props.options.length - 1;

        let positionClassName = firstOption ? "ss-button-primary-l" : lastOption ? "ss-button-primary-r" : "ss-button-primary-middle";
        let selectedClassName = this.optionsEqual(option, this.props.selectedOption) ? " ss-button-primary-selected" : " ss-button-primary-deselected";

        return positionClassName + " " + selectedClassName;
    };

    static getDisplayValue(option) {
        return (option && option.hasOwnProperty("name")) ? option.name : option;
    }

    render() {
        return (
            <div className="button-selector">
                {
                    this.props.options.map((option, index) =>
                        <button key={index}
                                type="button"
                                className={this.optionClassName(option, index)}
                                onClick={() => this.props.handleOptionSelected(option)}>
                            {ButtonSelector.getDisplayValue(option)}
                        </button>
                    )
                }
            </div>
        )
    }
}

ButtonSelector.defaultProps = {
    options: [],
    selectedOption: {},
    handleOptionSelected: null
};

export default ButtonSelector;