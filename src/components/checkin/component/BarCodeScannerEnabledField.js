import React from 'react'
import PropTypes from 'prop-types'
import Barcode from "./Barcode";
import 'css/ocr-enabled-field.css'
import Error from "../../Error";

const BarCodeScannerEnabledField = (props) => {

    const {
        name,
        label,
        onChange,
        readScannedResults,
        value,
        placeholder,
        isEnabled,
        error
    } = props

    const handleReadScannedResults = (results) => {
        readScannedResults(results);
    }

    return (
        <div className="ocr-enabled-field-container">
            <div className="ocr-enabled-field-input-container">
                <div className="ocr-enabled-field-field-container">
                    <fieldset className="ss-middle no-border">
                        <label htmlFor={name}>{label}</label>
                        <input type="text"
                               name={name}
                               value={value}
                               onChange={onChange}
                               placeholder={placeholder}
                        />
                    </fieldset>
                </div>
                <div className="ocr-enabled-field-file-dropper">
                    {isEnabled &&
                    <Barcode
                        readScannedResults={handleReadScannedResults}/>
                    }
                </div>
            </div>
            {
                error && <div className="ocr-enabled-field-error-container"><Error>{error}</Error></div>
            }
        </div>
    )
}

BarCodeScannerEnabledField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    readScannedResults: PropTypes.func.isRequired,
    value: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    error: PropTypes.string
}

export default BarCodeScannerEnabledField
