import React, { useEffect, useState } from 'react';
import axios from 'axios';
import firebase from 'firebase';
import 'firebase/firestore';
import '../HandleSignin/potato.css';

firebase.initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  authDomain: 'batata-scores.firebaseapp.com',
  projectId: 'batata-scores'
});

const db = firebase.firestore();

function Main({ user: loggedInUser }) {
  const [users, setUsers] = useState(
    localStorage.getItem('users')
      ? JSON.parse(localStorage.getItem('users'))
      : []
  );

  const [gitUsers, setGitUsers] = useState(
    localStorage.getItem('gitUsers')
      ? JSON.parse(localStorage.getItem('gitUsers'))
      : []
  );

  const [potatoesLeft, setPotatoesLeft] = useState(users.length ? users.filter(
    ({ username }) => username === loggedInUser.user.login
  )[0].potatoes : 0)

  useEffect(() => {
    if (!users.length) {
      (async function getWebAheadUsers() {
        try {
          const { data } = await axios.get(
            `https://api.github.com/orgs/webahead5/members?access_token=${process.env.REACT_APP_GITHUB_API}`
          );

          const millisecondsToDay = 86400000;

          data.forEach(async (gitUser, index) => {
            if (data.length - 1 === index) {
              db.collection('potatoes')
                .get()
                .then(querySnapshot => {
                  const usersData = [];

                  querySnapshot.forEach(doc => usersData.push(doc.data()));

                  setUsers(usersData);
                //   localStorage.setItem('users', JSON.stringify(usersData));
                  setGitUsers(data);
                //   localStorage.setItem('gitUsers', JSON.stringify(data));
                });
            }

            db.collection('potatoes')
              .doc(gitUser.login)
              .get()
              .then(doc => {
                const user = doc.data();

                if (!user) {
                  db.collection('potatoes')
                    .doc(gitUser.login)
                    .set({
                      username: gitUser.login,
                      batataScore: 0,
                      lastUsed: Date.now(),
                      potatoes: 0
                    });

                  return;
                }

                if (Date.now() - user.lastUsed > millisecondsToDay) {
                  const potatoes = parseInt(
                    (Date.now() - user.lastUsed) / millisecondsToDay
                  );

                  db.collection('potatoes')
                    .doc(user.username)
                    .update({
                      potatoes
                    });
                }
              })
              .catch(console.log);
            // db.collection("potatoes").doc(gitUser.login).set({
            //   username: gitUser.login,
            //   batataScore: 0,
            //   lastUsed: Date.now(),
            //   potatoes: 0

            // })
          });
        } catch (error) {
          console.log(error);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPotato = bigBatata => {
    db.collection('potatoes')
      .doc(bigBatata)
      .get()
      .then(doc => {
        const potatoData = doc.data();

        db.collection('potatoes')
          .doc(loggedInUser.user.login)
          .get()
          .then(secondDoc => {
            console.log(potatoData);
            const currentLoggedInUser = secondDoc.data();

            if (currentLoggedInUser.potatoes > 0) {
              db.collection('potatoes')
                .doc(bigBatata)
                .update({
                  batataScore: potatoData.batataScore + 1,
                  lastUsed: Date.now()
                });

              db.collection('potatoes')
                .doc(loggedInUser.user.login)
                .update({
                  potatoes: currentLoggedInUser.potatoes - 1,
                  lastUsed: Date.now()
                });

                setPotatoesLeft(prevCount => prevCount - 1)
            } else {
              console.log('awkward');
            }
          })
          .catch(() => 1);
      })
      .catch(() => 1);
  };

  const centerPage = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  if (loggedInUser.isLoggedIn && gitUsers.length && users.length) {
    const doesHeHavePotatoes = users.filter(
      ({ username }) => username === loggedInUser.user.login
    )[0].potatoes;
    return (
      <>
        <span className="potato-header">Choose who is the potato</span>
        <div className="potatoes-wrapper">
          {users.filter(({username}) => username !== loggedInUser.user.login).map(user => (
            <div className="potato-human-container">
              <img
                alt=""
                src={
                  gitUsers.filter(({ login }) => login === user.username)[0]
                    .avatar_url
                }
                className="potato-human-avatar"
              />
              <span style={{ fontSize: '25px' }}>{user.username}</span>
              {(doesHeHavePotatoes > 0 && potatoesLeft < 0)  ? (
                <img
                  alt=""
                  src="/potato.png"
                  className="potato-human-avatar"
                  onClick={() => addPotato(user.username)}
                />
              ) : (
                ''
              )}
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!loggedInUser.isLoggedIn) {
    return (
      <div style={centerPage}>
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`}
          className="potato-button"
        >
          Signin
        </a>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div style={centerPage}>
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

  return (
    <div>
      <a
        href={`https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`}
      >
        Signin
      </a>
    </div>
  );
}

export default Main;
