import React, { Fragment, useReducer } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/layout/Navbar';
import Users from './components/users/Users';
import User from './components/users/User';
import Search from './components/users/Search';
import Alert from './components/layout/Alert';
import About from './components/pages/About';
import './App.css';

const initialState = {
  user: {},
  users: [],
  repos: [],
  loading: false,
  alert: null,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'loading':
      return { ...state, loading: payload };
    case 'alert':
      return { ...state, alert: payload };
    case 'setUsers':
      return { ...state, users: payload, loading: false };
    case 'setUser':
      return { ...state, user: payload, loading: false };
    case 'setRepos':
      return { ...state, repos: payload, loading: false };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Search Github users
  const searchUsers = async (text) => {
    dispatch({ type: 'loading', payload: true });

    const res = await axios.get(
      `https://api.github.com/search/users?q=${text}&clien_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&client_secret=${process.env.REACT_APP_GITHUB_CLIENT_SECRET}`
    );

    dispatch({ type: 'setUsers', payload: res.data.items });
  };

  // Get single Github user
  const getUser = async (username) => {
    dispatch({ type: 'loading', payload: true });

    const res = await axios.get(
      `https://api.github.com/users/${username}?clien_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&client_secret=${process.env.REACT_APP_GITHUB_CLIENT_SECRET}`
    );

    dispatch({ type: 'setUser', payload: res.data });
  };

  // Get users repos
  const getUserRepos = async (username) => {
    dispatch({ type: 'loading', payload: true });

    const res = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=5&sort=created:asc&clien_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}&client_secret=${process.env.REACT_APP_GITHUB_CLIENT_SECRET}`
    );

    dispatch({ type: 'setRepos', payload: res.data });
  };

  // Clear users from state
  const clearUsers = () => dispatch({ type: 'setUsers', payload: [] });

  // Set Alert
  const setAlert = (msg, type) => {
    dispatch({ type: 'alert', payload: { msg, type } });

    setTimeout(() => dispatch({ type: 'alert', payload: null }), 5000);
  };

  return (
    <Router>
      <div className='App'>
        <Navbar />
        <div className='container'>
          <Alert alert={state.alert} />
          <Switch>
            <Route
              exact
              path='/'
              render={() => (
                <Fragment>
                  <Search
                    searchUsers={searchUsers}
                    clearUsers={clearUsers}
                    showClear={state.users.length > 0 ? true : false}
                    setAlert={setAlert}
                  />
                  <Users loading={state.loading} users={state.users} />
                </Fragment>
              )}
            />
            <Route exat path='/about' component={About} />
            <Route
              exact
              path='/user/:login'
              render={(props) => (
                <User
                  {...props}
                  getUser={getUser}
                  getUserRepos={getUserRepos}
                  user={state.user}
                  repos={state.repos}
                  loading={state.loading}
                />
              )}
            />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
