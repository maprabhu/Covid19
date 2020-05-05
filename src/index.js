import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyBbTPHEyxoKSu0JebU2uS_L4RLIv-rphyE",
  authDomain: "covid-19-4c97c.firebaseapp.com",
  databaseURL: "https://covid-19-4c97c.firebaseio.com",
  projectId: "covid-19-4c97c",
  storageBucket: "covid-19-4c97c.appspot.com",
  messagingSenderId: "334461165097",
  appId: "1:334461165097:web:25df9fea5fe6e95ba60638"
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
