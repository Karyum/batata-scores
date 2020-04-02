import React, { useEffect, useState } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import axios from 'axios';
import './potato.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function HandleSignin({ setUser, doRedirect }) {
  const query = useQuery();

  useEffect(() => {
    (async function getToken() {
      try {
        const {
          data: { token }
        } = await axios.get(
          `https://batata-gatekeeper.herokuapp.com/authenticate/${query.get(
            'code'
          )}`
        );

        const { data: userData } = await axios.get(
          'https://api.github.com/user',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setUser({ user: userData, isLoggedIn: true });

        console.log(userData);
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (doRedirect) {
    return <Redirect to="/" />;
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <img
        style={{
          maxWidth: '50vw',
          maxHeight: '50vh'
        }}
        className="rotating"
        alt=""
        src="/potato.png"
      />
    </div>
  );
}

export default HandleSignin;
