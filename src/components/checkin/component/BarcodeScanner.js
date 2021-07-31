import React, { Component } from "react";
import Dynamsoft from "dynamsoft-javascript-barcode";
import request from "../../../util/SuperagentUtils";
import "css/BarcodeScanner.css";

// This class should contain no internal react state and instead should rely on props
class BarcodeScanner extends Component {
    constructor(props) {
        super(props);
        this.bDestroyed = false;
        this.scanner = null;
        this.elRef = React.createRef();
    }

    async componentDidMount() {
        try {
            // Only load product keys and resource path on first time initialization or it will throw errors
            if (!Dynamsoft.BarcodeReader.productKeys) {
                let response;
                response = await request
                    .get("/api/ocr-keys")
                    .then((json) => {
                        let result = JSON.parse(json.text);
                        if (result) {
                            return result.dynamsoftKey;
                        }
                    })
                    .catch((err) => console.log(err));

                Dynamsoft.BarcodeReader.productKeys = await response;
                Dynamsoft.BarcodeReader.engineResourcePath =
                    "https://cdn.jsdelivr.net/npm/dynamsoft-javascript-barcode@7.6.0/dist/";
            }

            this.scanner = this.scanner || await Dynamsoft.BarcodeScanner.createInstance()

            if (this.bDestroyed) {
                this.scanner.destroy();
                return;
            }

            await this.scanner.setUIElement(this.elRef.current);

            //Set scanner to read PDF417
            let runtimeSettings = await this.scanner.getRuntimeSettings();
            runtimeSettings.barcodeFormatIds =
                Dynamsoft.EnumBarcodeFormat.BF_PDF417;
            await this.scanner.updateRuntimeSettings(runtimeSettings);

            this.scanner.onFrameRead = results => {
                if (results.length){
                    this.scanner.hide();
                    this.props.readScannedResults(results[0].BarcodeText);
                }
            };

            this.scanner.onUnduplicatedRead = (txt, result) => {
                this.scanner.hide();
                this.props.readScannedResults(txt);
            };

            await this.scanner.open();
            await this.scanner.setResolution(1280, 720);
        } catch (ex) {
            console.log(ex.message);
            console.error(ex);
        }
    }

    componentWillUnmount() {
        this.bDestroyed = true;
        if (this.scanner) {
            this.scanner.destroy();
        }
    }

    shouldComponentUpdate() {
        // Never update UI after mount, dbrjs sdk use native way to bind event, update will remove it.
        return false;
    }

    render() {
        return (
            <div ref={this.elRef} className="component-barcode-scanner">
                <svg className="dbrScanner-bg-loading" viewBox="0 0 1792 1792"/>
                <svg className="dbrScanner-bg-camera" viewBox="0 0 2048 1792">
                    <path d="M1024 672q119 0 203.5 84.5t84.5 203.5-84.5 203.5-203.5 84.5-203.5-84.5-84.5-203.5 84.5-203.5 203.5-84.5zm704-416q106 0 181 75t75 181v896q0 106-75 181t-181 75h-1408q-106 0-181-75t-75-181v-896q0-106 75-181t181-75h224l51-136q19-49 69.5-84.5t103.5-35.5h512q53 0 103.5 35.5t69.5 84.5l51 136h224zm-704 1152q185 0 316.5-131.5t131.5-316.5-131.5-316.5-316.5-131.5-316.5 131.5-131.5 316.5 131.5 316.5 316.5 131.5z" />
                </svg>
                <video className="dbrScanner-video" playsInline={true} />
                <canvas className="dbrScanner-cvs-drawarea" />
                <div className="dbrScanner-cvs-scanarea">
                    <div className="dbrScanner-scanlight"/>
                </div>
            </div>
        );
    }
}

export default BarcodeScanner;
