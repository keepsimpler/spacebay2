import React, {Component} from 'react'
import ModalForm from "../../ModalForm";
import Cropper from 'react-cropper'
import PropTypes from 'prop-types'

export default class ImageCropModal extends Component {

    static propTypes = {
        show: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        onImageCropped: PropTypes.func.isRequired,
        sourceDataUrl: PropTypes.string.isRequired
    }

    setCropper = (cropper) => {
        this.cropper = cropper;
    }

    handleCrop = () => {
        if (this.cropper) {
            const {onImageCropped} = this.props;
            const dataURL = this.cropper.getCroppedCanvas().toDataURL();
            // looks like we can get a blob directly from here
            onImageCropped(dataURL);
        }
    }

    render() {

        const {
            show,
            onClose,
            sourceDataUrl
        } = this.props

        return (
            <ModalForm
                showForm={show}
                size="large"
                title="Crop Uploaded Image"
                onClose={onClose}
                proceedEventHandler={this.handleCrop}
                textAlign="pull-right"
                textOk="Ok"
            >
                <Cropper
                    ref='cropper'
                    src={sourceDataUrl}
                    style={{width: '50%', height: 220}}
                    guides={true}
                    highlight={true}
                    viewMode={1}
                    onInitialized={(cropper) => this.cropper = cropper}
                    rotatable={true}
                    checkOrientation={false}
                />
            </ModalForm>
        )
    }
}

