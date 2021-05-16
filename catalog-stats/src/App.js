import React, { Component } from 'react';
import CatalogStatistics from './CatalogStatistics';

class App extends Component {
  render() {
    return (
      <div className="App">
        <CatalogStatistics
          // TODO: Add token here
          apiToken="tk02282499-e111-470b-bdc0-c95abdbc4033"
        />
      </div>
    );
  }
}

export default App;
