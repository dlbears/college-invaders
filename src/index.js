import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import './config/ReactotronConfig'
import * as serviceWorker from './serviceWorker';
import { StoreProvider } from './components/hooks/store'
import { reducers } from './components/hooks/reducers'

const rootEl = document.getElementById('root')


  

ReactDOM.render((
    <StoreProvider>
        <App />
    </StoreProvider>
), rootEl);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
