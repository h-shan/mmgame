import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import PlayPage from './pages/Play';

import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/play">
            <PlayPage />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
