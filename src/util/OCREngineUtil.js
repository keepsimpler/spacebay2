// import imageToBlob from "image-to-blob";
import {plateRecognizerRequest} from '../components/checkin/request/plateRecognizerRequest'
import {saveImageToS3Request} from '../components/checkin/request/saveImageToS3Request'
import {toast} from "react-toastify";
import imageCompression from 'browser-image-compression';

class OCREngine {

    static doOcr(image, setOcrText, fieldName, correlationId) {
        this.getBinary(image, setOcrText, fieldName, correlationId);
    }

    static getBinary = (image, setOcrText, fieldName, correlationId) => {
        // imageToBlob(image, '', (err, blob) => {
        //     OCREngine.callAws(setOcrText, fieldName, blob, correlationId);
        // });
    }

    static setDriversLicenseFields = (results) => {
        let lines = results.split('\n');
        let firstName = '';
        let lastName = '';
        let driversLicense = '';

        lines.forEach(function (line) {
            if (line.startsWith("DAC")) {
                firstName = line.slice(3, line.length);
            }
            if (line.startsWith("DCS")) {
                lastName = line.slice(3, line.length);
            }
            if (line.startsWith("DCK")) {
                driversLicense = line.slice(3, line.length);
            }
        });
        return {firstName, lastName, driversLicense};
    }

    static callPlateRecognizer(blob, setOcrText, correlationId) {
        const options = { 
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        try {
            imageCompression(blob, options).then(compressedFile => {
                plateRecognizerRequest(compressedFile, correlationId)
                .then(resp => {
                    if (resp) {
                        let data = JSON.parse(resp.text);
                        setOcrText(data.results[0].plate);
                    } else {
                        setOcrText("Please Try Again");
                    }
                })
            })
            .catch((err) => console.log(err))
        } catch (err) {
            console.log(err);
            toast.error(err);
        }
    }

    static saveImageS3(blob, setOcrText, fieldName, correlationId) {
        const options = { 
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        }
        imageCompression(blob, options).then(compressedFile => {
            saveImageToS3Request(compressedFile, correlationId)
            .then(resp => {
                if (resp && resp.body && resp.body.textDetections) {
                    this.processTextDetections(resp.body.textDetections, setOcrText, fieldName);
                }
            })
            .catch((err) => {
                    console.log(err);
                    toast.error("Network Failure, Please try again");
                }
            );
        })
    }

    static callAws(setOcrText, fieldName, blob, correlationId) {
        if ((fieldName === 'truckLicensePlateNumber') || (fieldName === 'chassisLicensePlateNumber')) {
            this.callPlateRecognizer(blob, setOcrText, correlationId);
        } else {
            this.saveImageS3(blob, setOcrText, fieldName, correlationId);
        }
    }

    static processTextDetections(data, setOcrText, fieldName) {
        let keepingParsing = true;
        for (let i = 0; i < data.length; i++) {
            if (data[i].type === 'LINE' && data[i].confidence >= 70 && keepingParsing) {
                let returnedText;
                let editText;
                let regex;
                switch (fieldName) {
                    case 'assetSize':
                        if (OCREngine.isoCodesMap.get(data[i].detectedText)) {
                            returnedText = OCREngine.isoCodesMap.get(data[i].detectedText);
                            setOcrText(returnedText);
                            keepingParsing = false;  
                        }
                        break;
                    case 'containerNumber':
                        regex = new RegExp('[a-zA-Z]{3}[uU]{1}[0-9]{7}');
                        editText = data[i].detectedText.replace(/\s/g, '').match(regex);
                        if (editText) {
                            setOcrText(editText.toString());
                            keepingParsing = false;
                        }
                        break;
                    default:
                        setOcrText(data[i].detectedText);
                        keepingParsing = false;
                }
            }
        }
        if (keepingParsing === true) {
            toast.error("Error Occurred, Please Try Again!");
        }
    }

    static isoCodesMap = new Map([

        // 20 Footer Codes
        ['20GP', '20'], ['20HR', '20'], ['20PF', '20'], ['20TD', '20'],
        ['20TG', '20'], ['20TN', '20'], ['22BU', '20'], ['22HR', '20'],
        ['22PC', '20'], ['22PF', '20'], ['22RC', '20'], ['22RS', '20'],
        ['22RT', '20'], ['22TD', '20'], ['22TG', '20'], ['22TN', '20'],
        ['22UP', '20'], ['22UT', '20'], ['22VH', '20'], ['26GP', '20'],
        ['26HR', '20'], ['28TG', '20'], ['28UT', '20'], ['28VH', '20'],
        ['29PL', '20'], ['2EGP', '20'], ['20G0', '20'], ['20G1', '20'],
        ['20H0', '20'], ['20P1', '20'], ['20T3', '20'], ['20T4', '20'],
        ['20T6', '20'], ['20T7', '20'], ['20T8', '20'], ['20T0', '20'],
        ['20T1', '20'], ['20T2', '20'], ['22B0', '20'], ['22G0', '20'],
        ['22G1', '20'], ['22H0', '20'], ['22P3', '20'], ['22P8', '20'],
        ['22P9', '20'], ['22P1', '20'], ['22P7', '20'], ['22R9', '20'],
        ['22R7', '20'], ['22R1', '20'], ['22S1', '20'], ['22T3', '20'],
        ['22T4', '20'], ['22T5', '20'], ['22T6', '20'], ['22T7', '20'],
        ['22T8', '20'], ['22T0', '20'], ['22T1', '20'], ['22T2', '20'],
        ['22U6', '20'], ['22U1', '20'], ['22V0', '20'], ['22V2', '20'],
        ['22V3', '20'], ['25G0', '20'], ['26G0', '20'], ['26H0', '20'],
        ['28T8', '20'], ['28U1', '20'], ['28V0', '20'], ['29P0', '20'],
        ['2EG0', '20'],

        // 40 Footer Codes
        ['42G1', '40'], ['42H0', '40'], ['42P3', '40'], ['42P8', '40'],
        ['42P9', '40'], ['42P1', '40'], ['42P6', '40'], ['42R9', '40'],
        ['42R3', '40'], ['42R1', '40'], ['42S1', '40'], ['42T5', '40'],
        ['42T6', '40'], ['42T8', '40'], ['42T2', '40'], ['42U6', '40'],
        ['42U1', '40'], ['42GP', '40'], ['42HR', '40'], ['42PC', '40'],
        ['42PF', '40'], ['42PS', '40'], ['42RC', '40'], ['42RS', '40'],
        ['42RT', '40'], ['42SN', '40'], ['42TD', '40'], ['42TG', '40'],
        ['42TN', '40'], ['42UP', '40'], ['42UT', '40'], ['45BK', '40'], 
        ['45GP', '40'], ['45PC', '40'], ['45RC', '40'], ['45RT', '40'], 
        ['45UT', '40'], ['45UP', '40'], ['46HR', '40'], ['45B3', '40'],
        ['45G0', '40'], ['45G1', '40'], ['45P3', '40'], ['45P8', '40'], 
        ['45R9', '40'], ['45R1', '40'], ['45U1', '40'], ['45U6', '40'], 
        ['46H0', '40'], ['48TG', '40'], ['49PL', '40'], ['48T8', '40'], 
        ['49P0', '40'], ['4CG0', '40'], ['4CGP', '40'],

        // 45 Footer Codes
        ['L0GP', '45'], ['L2GP', '45'], ['L2G1', '45'], ['L5GP', '45'], 
        ['L5GP', '45'], ['L5G1', '45'],

        // 48/50 Footer Codes
        ['M2G1', '50'], ['M5G1', '50'], ['M2R1', '50'], ['M5G1', '50'],
        ['M2U1', '50'], ['M5U1', '50'], ['M2P1', '50'], ['M5P1', '50'],
        ['M2T1', '50'], ['M5T1', '50']

    ]);
}

export default OCREngine;
