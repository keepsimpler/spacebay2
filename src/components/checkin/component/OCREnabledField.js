import React from 'react'
import FileDropper from "./FileDropper";
import PropTypes from 'prop-types'
import OCREngine from "../../../util/OCREngineUtil";
import 'css/ocr-enabled-field.css'
import Error from "../../Error";

const OCREnabledField = (props) => {

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

OCREnabledField.propTypes = {
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

export default OCREnabledField
