import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Parser from 'html-react-parser';
import axios from 'axios';

export class FetchData extends Component {
    displayName = FetchData.name

  constructor(props) {

      super(props);
      this.state = {
          forecasts: [],
          loading: true 
      };

      let loginData = this.props.auth.getLoginData();

      let accessToken = loginData["accessToken"];
      let gender = loginData["gender"];
      let friendCount = loginData["friendCount"];
      let localFriendCount = isNaN(friendCount) ? 0 : parseInt(friendCount, 10);

      if (accessToken != "") {

          var axiosOptions = {
              method: 'GET',
              url: 'api/SampleData/WeatherForecasts',
              headers: {
                  'Authorization': 'Bearer ' + accessToken
              }
          };

          axios(axiosOptions)
              .then(resp => {
                  this.setState({ forecasts: resp.data, loading: false });
                })
              .catch(function (error) {
                  debugger;
                  console.log(error.message);
              });

      }
  }

  static renderForecastsTable(forecasts) {
    return (
      <table className='table'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Temp. (C)</th>
            <th>Temp. (F)</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {forecasts.map(forecast =>
            <tr key={forecast.dateFormatted}>
              <td>{forecast.dateFormatted}</td>
              <td>{forecast.temperatureC}</td>
              <td>{forecast.temperatureF}</td>
              <td>{forecast.summary}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
    }

    // -- Lifecycle methods
    componentDidMount() {
        // -- could fetch data here as well
    }

    componentWillUnmount() {

    }

  render() {

      const { isAuthenticated } = this.props.auth;
      let contents = "";

      if (this.state.loading && !isAuthenticated()) {
          contents = Parser("<h3>You must be logged in to access this page</h3>" +
              "<p>Please return to home and login</p>");
      } else if (this.state.loading && isAuthenticated()) {
          contents = Parser("<p><em>Loading...</em></p>");
      } else if (!this.state.loading && isAuthenticated()) {
          contents = FetchData.renderForecastsTable(this.state.forecasts); 
      }

      return (
      <div>
        <h1>Weather forecast</h1>
        <p>This component demonstrates fetching data from the server.</p>
        {contents}
      </div>
      );

  } // -- render

}
