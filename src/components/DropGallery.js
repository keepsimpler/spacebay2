import React, {Component} from 'react';
import "../css/components/dropzone.css";
import DropzoneComponent from 'react-dropzone-component';
import {toast} from 'react-toastify';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import ModalForm from "../components/ModalForm";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 20;

class DropGallery extends Component {

    constructor(props) {
        super(props);
        this.galleryFiles = [];
        this.cropperRef = React.createRef();
        this.state = {
            errorMessage: this.props.errorMessage ? this.props.errorMessage : null,
            locationGallery: this.props.locationGallery ? this.props.locationGallery : null,
            locationId: this.props.locationId ? this.props.locationId : null,
            bucket: this.props.bucket ? this.props.bucket : null,
            showCropper: 0,
            cropFiles: [],
            dropzone: null
        }
    }

    UNSAFE_componentWillMount() {
        this.setState({
            errorMessage: this.props.errorMessage ? this.props.errorMessage : null,
            locationGallery: this.props.locationGallery ? this.props.locationGallery : null,
            locationId: this.props.locationId ? this.props.locationId : null,
            bucket: this.props.bucket ? this.props.bucket : null
        })
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        if (typeof newProps.errorMessage !== 'undefined') {
            this.setState({errorMessage: newProps.errorMessage});
        }
        if (typeof newProps.locationGallery !== 'undefined' && this.state.locationGallery !== newProps.locationGallery) {
            this.setState({locationGallery: newProps.locationGallery});
        }
        if (typeof newProps.locationId !== 'undefined' && this.state.locationId !== newProps.locationId) {
            this.setState({locationId: newProps.locationId});
        }
        if (typeof newProps.bucket !== 'undefined' && this.state.bucket !== newProps.bucket) {
            this.setState({bucket: newProps.bucket});
        }
    }

    handleFileAdded = file => {
        let _this = this;
        if (file && (typeof file.cropped == 'undefined' || file.cropped === 0)) {
            let fileReader = new FileReader();
            fileReader.onload = function () {
                let cropFiles = _this.state.cropFiles ? _this.state.cropFiles : [];
                if (file.status !== 'error') {
                    file.dataURL = fileReader.result;
                    file.cropped = 0;
                    cropFiles.push(file);
                    _this.dropzone.removeFile(file);
                    _this.setState({showCropper: 1, cropFiles: cropFiles});
                    _this.setState({errorMessage: null});
                }
            };
            fileReader.readAsDataURL(file);
        }

    };

    handleDzSuccess = file => {

    };

    handleDzMaxReached = file => {
        toast.error("Maximum files exceeded");
        //this.setState({errorMessage: "Maximum  files exceeded"});
    };

    handleDzError = file => {
        if (file.size > this.dropzone.options.maxFilesize * 1024 * 1024) {
            toast.error("File too large! Maximum size should be 20M");
        }
        this.dropzone.cancelUpload(file);
        this.dropzone.removeFile(file);
    };

    dropAdd = (file, url) => {
        this.dropzone.emit("addedfile", file);
        this.dropzone.emit("thumbnail", file, url);
        this.dropzone.emit("complete", file);
        this.dropzone.files.push(file);
    };

    preloadImages = () => {
        if (this.state.locationGallery) {
            for (let i = 0; i < this.state.locationGallery.length; i++) {
                let file = this.state.locationGallery[i],
                    url = 'https://s3-us-west-1.amazonaws.com/securspace-files/inventory/' + this.state.locationId + '/' + file.galleryImageFileName,
                    mockFile = {
                        name: file.galleryImageFileName,
                        cropped: 1,
                        size: null,
                        accepted: true,
                        type: 'fake',
                        url: url
                    };
                this.dropAdd(mockFile, url);
            }
        }
    };

    cancelCropper = type => {
        if (typeof type !== 'undefined') {
            //close after save so not shift
        } else {
            let cropFiles = this.state.cropFiles;
            cropFiles.shift();
            this.setState({cropFiles: cropFiles});
            this.setState({showCropper: cropFiles.length > 0, locationEqIndex: null});
        }
    };

    customRemoveFile = index => {
        this.dropzone.removeFile(this.dropzone.files[index]);
        this.forceUpdate();
    };

    _crop = () => {
        let cropFiles = this.state.cropFiles;
        let file = cropFiles.shift();
        if (file.status !== 'error') {

            let dataURL = this.cropperRef.current.cropper.getCroppedCanvas(
                {
                    width: 1024,
                    height: 680,
                    minWidth: 512,
                    minHeight: 340,
                    maxWidth: 4096,
                    maxHeight: 4096,
                    fillColor: '#fff',
                    imageSmoothingEnabled: false,
                    imageSmoothingQuality: 'high'
                }).toDataURL();
            file.dataURL = dataURL;
            file.cropped = 1;
            this.dropAdd(file, dataURL);
        } else {
            toast.error('WARNING! This file was marked as an error.');
        }

        this.setState({cropFiles: cropFiles});
        this.setState({showCropper: (cropFiles.length > 0 ? 1 : 0)});
    };

    render() {

        let _this = this;

        const config = {
            iconFiletypes: ['.jpg', '.png', '.gif'],
            showFiletypeIcon: false,
            showProgress: false,
            postUrl: 'no-url',
            drop: true
        };

        const djsConfig = {
            addRemoveLinks: true,
            maxFilesize: MAX_FILE_SIZE_MB,
            maxFiles: MAX_FILES,
            acceptedFiles: "image/jpeg,image/png,image/gif",
            autoProcessQueue: false,
            createImageThumbnails: false,
            dictDefaultMessage: "Click to select file or drop file"
        };

        // For a list of all possible events (there are many), see README.md!
        const eventHandlersDG = {
            init: (dropzone) => {
                _this.dropzone = dropzone;
                _this.preloadImages();
                _this.props.updateDropzone(_this.dropzone);
                if (this.props.setDropzone) {
                    this.props.setDropzone(dropzone);
                }
            },
            addedfile: this.handleFileAdded,
            error: this.handleDzError,
            success: this.handleDzSuccess,
            maxfilesexceeded: this.handleDzMaxReached
        }

        return (
            <div>
                <DropzoneComponent config={config} eventHandlers={eventHandlersDG} djsConfig={djsConfig}/>
                <div className="dz-gallery">
                    {
                        this.dropzone && this.dropzone.files.length > 0 ?
                            this.dropzone.files.map((item, index) =>
                                <div key={index} className="dz-image" data-key={index}>
                                    <img src={item.type === 'fake' ? item.url : item.dataURL} alt="gallery"/>
                                    <span><button type="button" onClick={(event) => this.customRemoveFile(index)}
                                                  title="Remove file">Remove file</button></span>
                                </div>
                            )
                            : ""
                    }
                </div>
                <ModalForm showForm={this.state.showCropper}
                           size="large"
                           title="Crop Uploaded Images"
                           onClose={_this.cancelCropper}
                           proceedEventHandler={this._crop}
                           textOk={this.state.cropFiles && this.state.cropFiles.length > 1 ? 'Next' : 'Save'}
                           textAlign="pull-right"
                           errorMessage={this.state.errorMessage}>
                    {this.state.cropFiles && this.state.cropFiles.length > 0 ?

                        <Cropper
                            ref={this.cropperRef}
                            src={this.state.cropFiles[0].dataURL}
                            style={{width: '100%', height: 340}}
                            guides={true}
                            highlight={true}
                            viewMode={1}
                        />
                        : null}
                </ModalForm>
            </div>
        )
    }
}

export default DropGallery;
