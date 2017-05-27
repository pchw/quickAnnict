'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  View,
  ActivityIndicator,
  AsyncStorage,
  Linking
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import axios from 'axios';

import config from '../config';
const {
  ANNICT_OAUTH_TOKEN_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  REDIRECT_URI,
  OAUTH_ACCESS_TOKEN_KEY,
  ACCESS_TOKEN
} = config;

import { Constants } from 'expo';

import OAuthScreen from './OAuthScreen';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'quickAnnict'
  };

  constructor(props) {
    super(props);

    this.state = {
      isShowOAuth: false
    };
  }
  componentDidMount() {
    Linking.addEventListener('url', this._handleRedirect.bind(this));
    const { params } = this.props.navigation.state;

    // OAuth認証から帰ってきたらparams.codeが取れる
    let code = params && params.code;
    if (code) {
      this.setState({ isShowOAuth: false });
      this.getToken(code).then(response => {
        const token = response.data.access_token;

        // Keychainに保存
        AsyncStorage.setItem(OAUTH_ACCESS_TOKEN_KEY, token, () => {
          this.navigateMainScreen(token);
        });
      });
    } else {
      // 起動時に保存してあるaccess tokenを取得する
      AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY, (err, token) => {
        if (!token && !ACCESS_TOKEN) {
          return this.navigateOAuthScreen();
        }
        return this.navigateMainScreen(token || ACCESS_TOKEN);
      });
    }
  }
  _handleRedirect(event) {
    if (!event.url.includes('callback')) {
      return;
    }
    this.setState({ isShowOAuth: false });

    const [, queryString] = event.url.split('?');
    const responseObj = queryString.split('&').reduce((map, pair) => {
      const [key, value] = queryString.split('=');
      map[key] = value;
      return map;
    }, {});

    const code = responseObj.code;

    this.getToken(code).then(response => {
      const token = response.data.access_token;

      // Keychainに保存
      AsyncStorage.setItem(OAUTH_ACCESS_TOKEN_KEY, token, () => {
        this.navigateMainScreen(token);
      });
    });
  }
  getToken(code) {
    return axios({
      url: ANNICT_OAUTH_TOKEN_URL,
      method: 'POST',
      data: {
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code
      }
    });
  }
  navigateMainScreen(token) {
    this.props.navigation.dispatch(
      NavigationActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'Episode',
            params: {
              accessToken: token
            }
          })
        ]
      })
    );
  }

  navigateOAuthScreen() {
    this.setState({ isShowOAuth: true });
  }

  render() {
    const modalView = this.state.isShowOAuth ? <OAuthScreen /> : void 0;
    return (
      <View>
        {modalView}
        <View styleName="fill-parent vertical v-center">
          <ActivityIndicator size="large" animating={true} />
        </View>
      </View>
    );
  }
}
