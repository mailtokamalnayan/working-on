import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyAw1HI0Kzm3quxDZeuHqwlVEUN0cgGdKZg",
    authDomain: "working-on-1b2e4.firebaseapp.com",
    databaseURL: "https://working-on-1b2e4.firebaseio.com",
    projectId: "working-on-1b2e4",
    storageBucket: "working-on-1b2e4.appspot.com",
    messagingSenderId: "1948177581"
  };
firebase.initializeApp(config);

export default firebase;