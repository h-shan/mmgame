import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import PlayPage from './pages/Play';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/play">
            <PlayPage />
          </Route>
          <Route path="/">
            <Redirect to="/play" />
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

export default App;
