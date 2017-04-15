'use strict';

import React, { Component } from 'react';
import { WebView, Modal } from 'react-native';

import { Text, View, Button } from '@shoutem/ui';

import qs from 'qs';
import config from '../config';

const { OAUTH_CLIENT_ID, ANNICT_OAUTH_AUTHORIZE_URL, REDIRECT_URI } = config;

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
    const webView = this.state.isShowWebView
      ? <WebView source={{ uri: this.state.uri }} />
      : void 0;

    const introView = this.state.isShowWebView
      ? void 0
      : <View>
          <Text style={{ marginBottom: 22, marginTop: 22 }}>
            quickAnnictでは素早くアニメの視聴記録をAnnictに保存することが出来ます。
          </Text>
          <Text style={{ marginBottom: 22 }}>
            Annictに記録するためにAnnictにログインする必要があります。
          </Text>
          <Button
            style={{
              backgroundColor: '#F75D75',
              borderColor: '#F75D75'
            }}
            onPress={() => {
              this.setState({ isShowWebView: true });
            }}
          >
            <Text>ログインする </Text>
          </Button>
        </View>;

    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={true}
        style={{ alignItems: 'flex-start' }}
      >
        <View style={{ flex: 1, padding: 22 }}>
          <Text style={{ alignSelf: 'center' }}>Login to Annict</Text>
          {introView}
          {webView}
        </View>
      </Modal>
    );
  }
}
