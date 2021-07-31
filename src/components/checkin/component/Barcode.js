import React, {Component} from "react";
import BarcodeScanner from "./BarcodeScanner";
import {IoMdQrScanner} from "react-icons/all";
import PropTypes from 'prop-types'

class Barcode extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showBarcodeScanner: false
        };
    }

    toggleBarcodeScanner = () => {
        this.setState({showBarcodeScanner: !this.state.showBarcodeScanner})
    }

    render() {
        return (
            <div className="file-dropper-container">
                <div className="ocr-enabled-field-field-container">
                    <IoMdQrScanner className='file-dropper-camera-icon' onClick={() => this.toggleBarcodeScanner()}/>
                    {this.state.showBarcodeScanner &&
                    <BarcodeScanner
                        readScannedResults={this.props.readScannedResults}
                    />
                    }
                </div>
            </div>
        )
    }
}

Barcode.propTypes = {
    readScannedResults: PropTypes.func.isRequired
}

export default Barcode;