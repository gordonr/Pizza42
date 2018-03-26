import history from '../history';
import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';
import axios from 'axios';
import PubSub from 'pubsub-js';

export default class Auth {

    auth0 = new auth0.WebAuth({
        domain: AUTH_CONFIG.domain,
        clientID: AUTH_CONFIG.clientId,
        redirectUri: AUTH_CONFIG.callbackUrl,
        audience: AUTH_CONFIG.audience,
        responseType: 'token id_token',
        scope: 'openid'
    });

    constructor() {
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
        this.getLoginData = this.getLoginData.bind(this);
    }

    login() {
        this.auth0.authorize();
    }

    handleAuthentication() {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult);
                history.replace('/');
            } else if (err) {
                history.replace('/');
                console.log(err);
                alert(`Error: ${err.error}. Check the console for further details.`);
            }
        });
    }

    getLoginData() {

        var myJson = {
            accessToken: "",
            friendCount: 0,
            gender: "Unknown",
        };

        // -- we'll just use this as the hub for state and store our
        //    couple of items individually
        if (localStorage.getItem('access_token') != null) 
            myJson.accessToken = localStorage.getItem('access_token');

        if (localStorage.getItem('friendCount') != null)
            myJson.friendCount = localStorage.getItem('friendCount');

        if (localStorage.getItem('gender') != null)
            myJson.gender = localStorage.getItem('gender');

        return myJson;
        
    }

    setSession(authResult) {

        let bodyString = JSON.stringify(authResult);
        console.log(bodyString);

        // -- pass the auth result, which will contain facebook token if
        //    facebook user, etc., to enricher method - 
        //    get as much add'l info as possible
        var axiosOptions = {
            method: 'POST',
            url: 'api/UserData/ProcessLogin',
            data: bodyString,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
            json: true
        };

        // -- make call to get add'l user info
        axios(axiosOptions)
            .then(function (response) {

                console.log(response.data);
                let json = response.data;

                // -- store what we learned
                localStorage.setItem('friendCount', json["friendCount"]);
                localStorage.setItem('gender', json["gender"]);

            })
            .then(() => {
                // -- store auth results
                let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
                localStorage.setItem('access_token', authResult.accessToken);
                localStorage.setItem('id_token', authResult.idToken);
                localStorage.setItem('expires_at', expiresAt);
            })
            .then(() => {

                // navigate to the home route
                history.replace('/');

            })
            .catch(function (error) {
                debugger;
                console.log(error.text);
            });

    }

    logout() {
        // Clear access token and ID token from local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');

        localStorage.removeItem('friendCount');
        localStorage.removeItem('gender');

        // navigate to the home route
        history.replace('/');
    }

    isAuthenticated() {
        // Check whether the current time is past the 
        // access token's expiry time
        let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return new Date().getTime() < expiresAt;
    }

}
