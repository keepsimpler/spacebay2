import React, {Component} from 'react';
import '../css/components/supplierList.css';
import SupplierListImage from "./SupplierListImage";
import {Link} from "react-router-dom";

const $ = window.$;

class SupplierList extends Component {

    componentDidMount() {
        let supplierListScrollSave = localStorage.getItem("supplierListScrollSave");
        $('.ss-supplier-list-container').scrollTop(supplierListScrollSave);
    }

    componentWillUnmount() {
        var supplierListScrollSave = $('.ss-supplier-list-container').scrollTop();
        localStorage.setItem("supplierListScrollSave", supplierListScrollSave);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.suppliers !== nextProps.suppliers) {
            localStorage.setItem("supplierListScrollSave", 0);
            $('.ss-supplier-list-container').scrollTop(0);
        }
    }

    onSupplierClicked = (selectedSupplier) => {
        this.setState({selectedSupplier: selectedSupplier});
        this.props.handleSupplierSelected(selectedSupplier);
        if (selectedSupplier) {
            let windowLink = window.location.href;
            windowLink = windowLink.split('?');

            let url = windowLink[0] + '?initLat=' + selectedSupplier.addressLatitude + '&initLng=' + selectedSupplier.addressLongitude + '&selectedSupplier=' + selectedSupplier.locationId;
            if (window.history.replaceState) {
                //prevents browser from storing history with each change:
                //window.history.replaceState("", "", url);
                window.history.pushState({}, null, url);
            }
            this.props.setUrl(window.location.href);
        }

    };

    render() {
        let numberOfSuppliers = this.props.suppliers ? this.props.suppliers.length : 0;
        return (
            <div className="ss-supplier-list-container">

                    <h1 className="ss-supplier-list-title">{this.props.displayName} Secure Storage & Parking</h1>

                    <h2 className="ss-supplier-list-search-count">{numberOfSuppliers} {numberOfSuppliers === 1 ? 'result' :'results'}</h2>
                {
                    this.props.suppliers.map((supplier, index) =>

                        <div key={index} className="ss-supplier-list-flex-item col-lg-6 col-md-12 col-sm-12">
                            <SupplierListImage supplier={supplier}
                                               recurringBooking={this.props.recurringBooking}
                                               selectedFrequencyType={this.props.selectedFrequencyType}
                                               isSelected={(this.props.searchSelectedSupplier && this.props.searchSelectedSupplier.locationId && this.props.searchSelectedSupplier.locationId === supplier.locationId)}
                                               onSupplierClicked={this.onSupplierClicked}
                                               key={index}
                            />
                        </div>
                    )
                }
                <div className="need-help"><div>Need Help? Reach out to <Link
                    to="/contact"><strong>Secūr<span>Space</span></strong></Link> for help!
                </div>
                </div>
            </div>
        )
    }
}

export default SupplierList;
