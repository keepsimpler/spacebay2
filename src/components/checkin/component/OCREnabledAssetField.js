import React from 'react'
import FileDropper from "./FileDropper";
import PropTypes from 'prop-types'
import OCREngine from "../../../util/OCREngineUtil";
import 'css/ocr-enabled-field.css'
import Select from "../../Select";
import Error from "../../Error";

const OCREnabledAssetField = (props) => {

    const {
        name,
        label,
        onChange,
        setText,
        value,
        placeholder,
        isEnabled,
        correlationId,
        error
    } = props

    const processDataUrl = (dataUrl) => {
        OCREngine.doOcr(dataUrl, (text) => setText(text), name, correlationId);
    }

    return (
        <div className="ocr-enabled-field-container">
            <div className="ocr-enabled-field-input-container">
                <div className="ocr-enabled-field-field-container">
                    <fieldset className="ss-middle no-border">
                        <label>{label}</label>
                        <Select id="assetSize"
                                name={name}
                                optionsWidth="300px"
                                className="ss-book-space-form-asset-size"
                                handleChange={onChange}
                                selectedOption={value}
                                placeholder={placeholder}
                                options={["20", "40", "45", "53"]}
                        />
                    </fieldset>
                </div>
                <div className="ocr-enabled-field-file-dropper">
                    {isEnabled &&
                    <FileDropper setDataUrl={processDataUrl}/>
                    }
                </div>
            </div>
            {
                error && <div className="ocr-enabled-field-error-container"><Error>{error}</Error></div>
            }
        </div>
    )
}

OCREnabledAssetField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    setText: PropTypes.func.isRequired,
    value: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    correlationId: PropTypes.string.isRequired,
    error: PropTypes.string
}

export default OCREnabledAssetField
