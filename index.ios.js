/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';

import { StackNavigator } from 'react-navigation';
const quickAnnict = StackNavigator({
  Home: {
    screen: require('./js/HomeScreen').default,
    path: /^callback/
  },
  Episode: {
    screen: require('./js/EpisodeScreen').default
  },
  Oauth: {
    screen: require('./js/OAuthScreen').default
  },
}, {
  containerConfig: {
    URIPrefix: 'qani://'
  }
});


AppRegistry.registerComponent('quickAnnict', () => quickAnnict);
