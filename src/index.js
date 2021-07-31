// import 'babel-polyfill';
import "core-js/stable";
import "regenerator-runtime/runtime";

import React from 'react';
import ReactDOM from 'react-dom';
import SecurSpaceApp from './SecurSpaceApp';
import { unregister } from './registerServiceWorker';

import './css/hs-elements.css';

ReactDOM.render(
  <SecurSpaceApp />,
  document.getElementById('root')
);
unregister();