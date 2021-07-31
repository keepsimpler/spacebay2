import React, {Component} from 'react';
import '../css/components/select.css';

const KEY_CODE_ENTER = 13;
const KEY_CODE_UP_ARROW = 38;
const KEY_CODE_DOWN_ARROW = 40;

class Select extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            items: props.options,
            allItems: props.options,
            firstOption: props.selectedOption ? props.selectedOption : {},
            canSearch: (typeof props.canSearch !== 'undefined' && props.canSearch === "1") ? true : false
        };

        this.selectedOptionIndex = '';


        this.applyFilters = this.applyFilters.bind(this);
        this.searchKeyPress = this.searchKeyPress.bind(this);
    }

    safeSetState = (stateUpdates) => {
        if(this.mounted) {
            this.setState(stateUpdates)
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (this.props.options !== newProps.options) {
            this.safeSetState({allItems: newProps.options});
            this.safeSetState({firstOption: newProps.options[0]});
            this.safeSetState({items: newProps.options});
        }
    }

    componentWillUnmount() {
        this.mounted = false
        document.body.removeEventListener('click', this.hideOptions);
    }

    showOptions = () => {
        this.safeSetState({show: true});
        document.body.addEventListener('click', this.hideOptions, true);
    };

    hideOptions = () => {
        this.safeSetState({show: false});
        document.body.removeEventListener('click', this.hideOptions);
    };

    selectOption = (selectedOption, index, hideOptions, scrollIntoView) => {
        this.selectedOptionIndex = index;
        this.props.handleChange({
            target: {
                name: this.props.name,
                type: 'select',
                value: selectedOption
            }
        });
        if (this.state.canSearch) document.getElementById("searchId").value = selectedOption.displayValue;
        if (hideOptions) {
            this.hideOptions();
        }
        let selectedListItem = document.getElementById(selectedOption.value);
        if (scrollIntoView && selectedListItem) {
            selectedListItem.scrollIntoView(false);
        }
    };

    getSelectClass = () => {
        return this.props.className + " ss-select "+ (this.state.canSearch ?   "with-search" : "");
    };

    getSelectInputClass = () => {
        return this.props.className? (this.props.className + " ss-select-text " + (this.props.placeholder ? "" : "ss-select-caret")) : "";
    };

    applyFilters = (event) => {
        this.showOptions();
        var updatedList = this.state.allItems,
            myObj = this,
            searchFilter =  event.target.value.toLowerCase();

        if (searchFilter.length > 0) {
            var count = 0;
            updatedList = updatedList.filter(function (item) {
                if (item.displayValue.toLowerCase().search(searchFilter) !== -1) {
                    if (count === 0) {
                        myObj.state.firstOption = item;
                    }
                    count++;
                    return true;
                } else return false;
            });
        }
        this.safeSetState({items: updatedList});
    };

    searchKeyPress = (event) => {
        if (event.keyCode === KEY_CODE_ENTER || event.which === KEY_CODE_ENTER) {
            if (this.state.items && this.state.items.length > 0) {
                let newSelectedOptionIndex = this.isCurrentSelectedIndexValid() ? this.selectedOptionIndex : 0;
                this.selectOption(this.state.items[newSelectedOptionIndex], newSelectedOptionIndex, true, false);
            }
        } else if (event.keyCode === KEY_CODE_UP_ARROW || event.which === KEY_CODE_UP_ARROW) {
            if (this.state.items && this.state.items.length > 0) {
                let newSelectedOptionIndex = this.shouldDecrementCurrentIndex() ? this.selectedOptionIndex - 1 : 0;
                this.selectOption(this.state.items[newSelectedOptionIndex], newSelectedOptionIndex, false, true);
            }
        } else if (event.keyCode === KEY_CODE_DOWN_ARROW || event.which === KEY_CODE_DOWN_ARROW) {
            if (this.state.items && this.state.items.length > 0) {
                let newSelectedOptionIndex = this.shouldIncrementCurrentIndex() ? this.selectedOptionIndex + 1 : 0;
                this.selectOption(this.state.items[newSelectedOptionIndex], newSelectedOptionIndex, false, true);
            }
        } else {
            this.props.handleChange({
                target: {
                    name: this.props.name,
                    type: 'select',
                    value: {"value":null,"displayValue":""}
                }
            });
        }
    };

    isCurrentSelectedIndexValid = () => {
        return typeof this.selectedOptionIndex === 'number' && this.selectedOptionIndex >= 0 && this.selectedOptionIndex < this.state.items.length;
    };

    shouldIncrementCurrentIndex = () => {
        return typeof this.selectedOptionIndex === 'number' && this.selectedOptionIndex + 1 > 0 && this.selectedOptionIndex + 1 < this.state.items.length;
    };

    shouldDecrementCurrentIndex = () => {
        return typeof this.selectedOptionIndex === 'number' && this.selectedOptionIndex - 1 > 0 && this.selectedOptionIndex - 1 < this.state.items.length;
    };

    static getDisplayValue(option) {
        return (option && typeof option.getDisplayValue === "function") ? option.getDisplayValue() : option;
    }

    render() {
        let inputElement;

        if (!this.state.canSearch) {
            //old version
            inputElement = <input type="text"
                                  id={this.props.id}
                                  name={this.props.name}
                                  style={this.props.style}
                                  value={Select.getDisplayValue(this.props.selectedOption)}
                                  onClick={this.showOptions}
                                  className={this.getSelectInputClass()}
                                  placeholder={this.props.placeholder}
                                  readOnly
            />
        } else {
            // interactive search
            inputElement = <input type="text"
                                  id="searchId"
                                  name="searchName"
                                  style={this.props.style}
                                  onClick={this.showOptions}
                                  placeholder={this.props.placeholder}
                                  onChange={this.applyFilters}
                                  onKeyDown={this.searchKeyPress}
                                  autoComplete="off"
            />
        }

        return (

            <div className={this.getSelectClass()}>
                {inputElement}
                <div className={this.state.show ? "ss-select-options-visible" : "ss-select-options-hidden"} >
                    <ul className="ss-select-list">
                        {
                            this.state.items.map((option, index) =>
                                <li id={option ? option.value : index}
                                    key={index}
                                    className={option === this.props.selectedOption ? "ss-select-item sel-item" : "ss-select-item"}
                                    onClick={() => this.selectOption(option, index, true, false)}>
                                    {Select.getDisplayValue(option)}
                                </li>
                            )
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

export default Select;
