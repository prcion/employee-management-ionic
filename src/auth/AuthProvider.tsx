import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { login as loginApi } from './AuthService';
import {Plugins} from "@capacitor/core";
import {Redirect} from "react-router-dom";


type LoginFn = (username?: string, password?: string) => void;
export type LogoutFn = () => void;

export interface AuthState {
  authenticationError: Error | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login?: LoginFn;
  logout?: LogoutFn;
  pendingAuthentication?: boolean;
  username?: string;
  password?: string;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthenticating: false,
  authenticationError: null,
  pendingAuthentication: false,
  token: '',
};

function intialStateVerifyIfIsAuthenticated() :AuthState  {
  const { Storage } = Plugins;
  const res = Storage.get({ key: 'token' });
  res.then(r => {
    if(r.value != null) {
      initialState.isAuthenticated = true;
      initialState.token = r.value;
    }
  });
  return initialState;
}

export const AuthContext = React.createContext<AuthState>(intialStateVerifyIfIsAuthenticated());

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;
  const login = useCallback<LoginFn>(loginCallback, []);
  const logout = useCallback<LogoutFn>(logoutCallback, []);
  useEffect(authenticationEffect, [pendingAuthentication]);
  const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token };
  const { Storage } = Plugins;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function logoutCallback(): void {
    console.log("11");
    Storage.clear();

    setState({
      ...state,
      token: "",
      isAuthenticated: false,
      isAuthenticating: false,
    });

  }

  function loginCallback(username?: string, password?: string): void {
    console.log("vine aici");
    setState({
      ...state,
      pendingAuthentication: true,
      username,
      password
    });
  }

  function authenticationEffect() {
    let canceled = false;
    authenticate();
    return () => {
      canceled = true;
    }

    async function authenticate() {
      if (!pendingAuthentication) {
        return;
      }
      try {
        setState({
          ...state,
          isAuthenticating: true,
        });
        const { username, password } = state;
        const { token } = await loginApi(username, password);
        await Storage.set({
          key: 'token',
          value: token
        });
        if (canceled) {
          return;
        }
        setState({
          ...state,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        });
      } catch (error) {
        if (canceled) {
          return;
        }
        setState({
          ...state,
          authenticationError: error,
          pendingAuthentication: false,
          isAuthenticating: false,
        });
      }
    }
  }
};
