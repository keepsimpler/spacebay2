import React, {Component} from 'react';
import '../css/components/multipleSelectCriteria.css';
import "../css/components/closeIcon.css";
import "../css/theme/buttons.css";

class MultipleSelectCriteria extends Component {

    constructor(props) {
        super(props);

        this.state = {
            items: this.props.items,
            allItemsSelected: this.props.allItemsSelected
        };

    }



    toggleSelectAll = () => {
        let _this = this;
        let currentSelectedStateForAllItems = this.state.allItemsSelected;
        let newSelectedStateForAllItems = !currentSelectedStateForAllItems;

        let updatedValueItems = {};

        Object.keys(this.state.items).forEach(function (key) {
            let updatedValueItem = Object.assign({}, _this.state.items[key], {value: newSelectedStateForAllItems});
            Object.assign(updatedValueItems, {
                [key]: updatedValueItem,
            });
        });

        this.setState({allItemsSelected: newSelectedStateForAllItems, items: updatedValueItems});
    };

    handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.checked;

        //This merges the new value for the value property into the item object without overwriting the other property values
        let updatedValueItem = Object.assign({}, this.state.items[name], {value: value});
        //This merges the new value for the item into the items object without overwriting any other item in items
        let updatedValueItems = Object.assign({}, this.state.items, {
            [name]: updatedValueItem,
        });
        this.setState({items: updatedValueItems});
        if (!this.props.onClose) {
            this.props.onChange({
                target: {
                    name: this.props.name,
                    value: updatedValueItems
                }
            });
        }
    };

    applySelectionChanges = () => {
        this.props.onChange({
            target: {
                name: this.props.name,
                value: this.state.items
            }
        });
        this.props.onSelectAll({
            target: {
                name: this.props.selectAllName,
                value: this.state.allItemsSelected
            }
        });
        this.props.onClose();
    };


    render() {
        let _this = this;
        return (
            <div className="ss-multiple-select-criteria">
                <span className="ss-multiple-select-criteria-title">{this.props.title}</span>
                <img alt="Close" className="ss-close" src="../app-images/close.png" onClick={this.props.onClose}/>
                {
                    (this.props.type && this.props.type === "div") ?
                        <div className="ss-form ss-block w100 pull-left">
                            {
                                Object.keys(this.state.items).map((key) => {
                                    let item = _this.state.items[key];
                                    return <label key={key}>
                                        <input type="checkbox" name={key} onChange={_this.handleChange}
                                               value={item.value} checked={item.value}/>
                                        <span className="ss-multiple-select-criteria-item">{item.label}</span>
                                    </label>
                                })
                            }
                            <hr/>
                            <div className="clear"></div>
                            <button type="button" className="ss-button-primary hidden"
                                    onClick={this.applySelectionChanges}>Apply Changes
                            </button>
                            <button type="button" className="ss-done-btn" onClick={this.props.onDone}>{this.props.doneLabel ? this.props.doneLabel : "Done"}</button>
                            <div className="ss-select-all-items hidden"
                                 onClick={_this.toggleSelectAll}>{this.state.allItemsSelected ? "Unselect all" : "Select all"}</div>

                        </div>
                        :
                        <form className="ss-form ss-block">
                            {
                                Object.keys(this.state.items).map((key) => {
                                    let item = _this.state.items[key];
                                    return <label key={key}>
                                        <input type="checkbox" name={key} onChange={_this.handleChange}
                                               checked={item.value}/>
                                        <span className="ss-multiple-select-criteria-item">{item.label}</span>
                                    </label>
                                })
                            }
                            <hr/>
                            <button type="button" className="ss-button-primary" onClick={this.applySelectionChanges}>
                                Apply Changes
                            </button>
                            <button type="button" className="ss-button-secondary" onClick={this.props.onClose}>Cancel
                            </button>
                            <div className="ss-select-all-items"
                                 onClick={_this.toggleSelectAll}>{this.state.allItemsSelected ? "Unselect all" : "Select all"}</div>
                        </form>
                }

            </div>
        )
    }
}

export default MultipleSelectCriteria;
