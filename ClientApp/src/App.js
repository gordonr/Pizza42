import React, { Component } from 'react';
import { Route, Router } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';

import Callback from './components/Callback';
import Auth from './components/Auth';
import history from './history';

const auth = new Auth();

const handleAuthentication = ({ location }) => {
    if (/access_token|id_token|error/.test(location.hash)) {
        auth.handleAuthentication();
    }
}

const MyHomeComponent = (props) => {

    return (
        <Home auth={auth} {...props} />
    );       

}

const MyFetchData = (props) => {
    
    return (
        <FetchData auth={auth} {...props} />
    );

}

const MyCallback = (props) => {

    handleAuthentication(props);
    return (
        <Callback {...props} />
    );
}

//<Route path="/callback" render={(props) => {
//    handleAuthentication(props);
//    return <Callback {...props} />



export default class App extends Component {
  displayName = App.name

    render() {

        return (
            <Router history={history}>
            <Layout>
                <Route exact path='/' render={ MyHomeComponent } />
                <Route path='/counter' component={ Counter } />
                <Route path='/fetchdata' render={ MyFetchData } />
                <Route path='/callback' render={ MyCallback } />
                </Layout>
            </Router>
        );
    }
}
