import React, { Component } from 'react';
import Auth0 from 'auth0-js';
import { Navbar, Button } from 'react-bootstrap';
import PubSub from 'pubsub-js';
import Parser from 'html-react-parser';

export class Home extends Component {

  displayName = Home.name

    constructor(props) {
        super(props);
        this.state = {
            gender: "",
            friendCount: 0
        };
    }

    goTo(route) {
        this.props.history.replace(`/${route}`)
    }

    login() {
        this.props.auth.login();
    }

    logout() {
        this.props.auth.logout();
    }


    // -- Lifecycle methods
    componentDidMount() {
        
    }

    componentWillUnmount() {

    }

  render() {

      let loginData = this.props.auth.getLoginData();

      let gender = loginData["gender"];
      let friendCount = loginData["friendCount"];  
      let localFriendCount = isNaN(friendCount) ? 0 : parseInt(friendCount, 10);

      let loginMsg = ""; 

      const { isAuthenticated } = this.props.auth;

      if (isAuthenticated()) {
          loginMsg = "<br></br>";
          if (localFriendCount > 0) {
              loginMsg += ("Hey, you're popular. You have " + localFriendCount.toString() + " friends! <br></br> ");
              loginMsg += ("You should invite them over for a pizza party. ");
              if (gender.toLocaleUpperCase().startsWith("M")) {
                  loginMsg += ("Maybe make it a \"Guys Night Out\" just for fun :) ");
              } else if (gender.toLocaleUpperCase().startsWith("F")) {
                  loginMsg += ("Maybe make it a \"Ladies Night Out\" just for fun  :) ");
              }
          } else {
              loginMsg += ("It looks like you could use some friends! <br></br>Why ");
              loginMsg += ("not invite everyone over for a pizza party? ");
              if (gender.toLocaleUpperCase().startsWith("M")) {
                  loginMsg += "Become a popular guy!";
              } else if (gender.toLocaleUpperCase().startsWith("F")) {
                  loginMsg += "Become a popular gal!";
              }
          }        

      } // -- if isAuthenticated()

      return (

          <div className="container">
              <h2>Welcome to Pizza 42!</h2>
                  <h3>Our cloud-based ordering system lets you order your pie in the sky!</h3>
              <br></br>
              {
                  isAuthenticated() && (
                      <div>
                      <h4>
                              You are logged in!
                              {Parser(loginMsg)}
                      </h4>
                          <br></br>     
                      <Button
                              id="qsLogoutBtn"
                              bsStyle="primary"
                              className="btn-margin"
                              onClick={this.logout.bind(this)}
                          >
                              Log Out
                  </Button>

                 </div>


                  )
              }
              {
                  !isAuthenticated() && (
                      <h4>
                          You are not logged in! Please{' '}
                          <a
                              style={{ cursor: 'pointer' }}
                              onClick={this.login.bind(this)}
                          >
                              Log In
                </a>
                          {' '}to continue.
              </h4>
                  )
              }
          </div>




    );
  }
}
