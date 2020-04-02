import React, { useState, useEffect } from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import 'firebase/firestore';

import HandleSignin from './pages/HandleSignin';
import Main from './pages/Main';

import './App.css';

function App() {
  const [user, setUser] = useState({
    user: null,
    isLoggedIn: false
  });

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            component={props => <Main {...props} user={user} />}
          />
          <Route
            exact
            path="/signin"
            component={props => (
              <HandleSignin
                setUser={setUser}
                doRedirect={user.isLoggedIn}
                {...props}
              />
            )}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;

// batataScore: 0
// lastUsed: 1585853736313
// potatoes: 0
// username: "shiryz"
