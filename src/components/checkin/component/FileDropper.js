import React, {useRef, useState} from 'react'
import {AiFillCamera} from "react-icons/all";
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import ImageCropModal from "./ImageCropModal";

import 'css/file-dropper.css'

const FileDropper = (props) => {

    const { className, setDataUrl } = props;
    const dropzoneRef = useRef(null);

    const [imageToCrop, setImageToCrop] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    const openDropZone = () => {
        if (dropzoneRef && dropzoneRef.current) {
            dropzoneRef.current.open();
        }
    }

    const onDropAcceptedInternal = (acceptedFiles) => {
        if(acceptedFiles && acceptedFiles[0]) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const file = acceptedFiles[0];
                file.dataUrl = fileReader.result;
                setImageToCrop(file.dataUrl);
                setShowCropper(true);
            }

            fileReader.readAsDataURL(acceptedFiles[0]);
        }
    }

    const onCropFinished = (dataUrl) => {
        setDataUrl(dataUrl);
        setShowCropper(false);
    }

    return (
        <div className="file-dropper-container">
            <AiFillCamera className={classNames('file-dropper-camera-icon', className)} onClick={openDropZone} />
            <Dropzone ref={ dropzoneRef } accept="image/*" onDropAccepted={onDropAcceptedInternal} noClick noKeyboard noDrag>
                {
                    ({ getRootProps, getInputProps }) => {
                        return (
                            <div className="file-dropper-dropzone-container">
                                <div { ...getRootProps({ className: 'file-dropper-dropzone-root' }) }>
                                    <input className="file-dropper-dropzone-input" { ...getInputProps() } />
                                </div>
                            </div>
                        )
                    }
                }
            </Dropzone>

            {
                imageToCrop &&
                <ImageCropModal
                    show={showCropper}
                    onClose={() => setShowCropper(false)}
                    onImageCropped={onCropFinished}
                    sourceDataUrl={imageToCrop}
                />
            }
        </div>
    )
}

FileDropper.propTypes = {
    className: PropTypes.string,
    setDataUrl: PropTypes.func.isRequired
}

export default FileDropper
