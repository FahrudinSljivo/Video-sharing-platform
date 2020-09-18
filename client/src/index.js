import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom";
import Reducer from './_reducers';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';



const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, ReduxThunk)(createStore);

///Provider Redux store cini vidljivim svim ugnijezdenim komponentama. 
///Pravilo je da se Provider postavi na vrh stabla komponenti kako bi sve imale pristup.
///StackOverflow ==>
///Reduceri se koriste za state management aplikacije. Npr. ako korisnik napise nesto u HTML input, aplikacija mora
///nekako upravljati svojim stateom. Linije 25 i 26 su ekstenzije koje je potrebno dodati u react-redux store.
ReactDOM.render(
    <Provider
        store={createStoreWithMiddleware(
            Reducer,
            window.__REDUX_DEVTOOLS_EXTENSION__ &&
            window.__REDUX_DEVTOOLS_EXTENSION__()
        )}
    >
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
    , document.getElementById('root'));
serviceWorker.unregister();
