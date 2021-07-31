import firebase from "firebase/app";

const config = {
    apiKey: "AIzaSyDVqQ-SCfy2gIetClSQijzKPIEJqDgTUDU",
    authDomain: "securspace-21ea7.firebaseapp.com",
    databaseURL: "https://securspace-21ea7.firebaseio.com",
    projectId: "securspace-21ea7",
    storageBucket: "securspace-21ea7.appspot.com",
    messagingSenderId: "1010074829832"
}
const FirebaseApp = firebase.initializeApp(config);
export default FirebaseApp;