import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OauthSender } from 'react-oauth-flow';

import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async function getWebAheadUsers() {
      try {
        const { data } = await axios.get(
          `https://api.github.com/orgs/webahead/members?access_token=${process.env.REACT_APP_GITHUB_API}`
        );

        console.log(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  if (!isLoggedIn) {
    return (
      <OauthSender
        authorizeUrl="https://www.dropbox.com/oauth2/authorize"
        clientId={process.env.CLIENT_ID}
        redirectUri="https://www.yourapp.com/auth/dropbox"
        state={{ from: '/settings' }}
        render={({ url }) => <a href={url}>Connect to Dropbox</a>}
      />
    );
  }

  return <div className="App"></div>;
}

export default App;
