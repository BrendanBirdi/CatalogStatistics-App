import React, { Component } from 'react';
import CatalogStatistics from './CatalogStatistics';

class App extends Component {
  render() {
    return (
      <div className="App">
        <CatalogStatistics
          // TODO: Add token here
          apiToken=""
        />
      </div>
    );
  }
}

export default App;
