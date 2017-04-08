'use strict';

import React, { Component } from 'react';
import { InteractionManager } from 'react-native';
import { NavigationActions } from 'react-navigation';

import { Spinner, View, Screen } from '@shoutem/ui';

import axios from 'axios';

import config from '../config';
const {
  ANNICT_OAUTH_TOKEN_URL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  REDIRECT_URI
} = config;

import * as Keychain from 'react-native-keychain';

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'quickAnnict'
  };

  constructor(props) {
    super(props);

    this.state = {};
  }
  componentDidMount() {
    const { params } = this.props.navigation.state;

    // OAuth認証から帰ってきたらparams.codeが取れる
    const code = params && params.code;
    if (code) {
      this.getToken(code).then(response => {
        const token = response.data.access_token;

        // Keychainに保存
        Keychain.setGenericPassword('', token)
          .then(() => {
            this.navigateMainScreen(token);
          })
          .catch(err => {
            console.error(err);
          });
      });
    } else {
      // 起動時に保存してあるaccess tokenを取得する
      Keychain.getGenericPassword()
        .then(credentials => {
          const token = credentials.password;
          if (!token) {
            return new Promise.reject('no token found');
          }
          this.navigateMainScreen(token);
        })
        .catch(err => {
          console.error(err);
          // KeyChainに情報がないのでOAuth認証へ進む
          this.props.navigation.dispatch(
            NavigationActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: 'Oauth' })]
            })
          );
        });
    }
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

  render() {
    return (
      <Screen>
        <View styleName="fill-parent vertical v-center">
          <Spinner size="large" />
        </View>
      </Screen>
    );
  }
}
