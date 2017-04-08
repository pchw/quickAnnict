'use strict';

import React, { Component } from 'react';
import { WebView } from 'react-native';

import { Screen } from '@shoutem/ui';

import qs from 'qs';
import config from '../config';

const {
  OAUTH_CLIENT_ID,
  ANNICT_OAUTH_AUTHORIZE_URL,
  REDIRECT_URI
} = config;

export default class OAuthScreen extends React.Component {
  static navigationOptions = {
    title: 'quickAnnict'
  };

  constructor(props) {
    super(props);

    const param = {
      client_id: OAUTH_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: 'read write'
    };

    this.state = {
      uri: `${ANNICT_OAUTH_AUTHORIZE_URL}?${qs.stringify(param)}`
    };
  }

  render() {
    return (
      <Screen>
        <WebView source={{ uri: this.state.uri }} />
      </Screen>
    );
  }
}
