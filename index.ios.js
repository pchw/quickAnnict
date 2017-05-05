import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';

import { StackNavigator, TabNavigator } from 'react-navigation';

const quickAnnict = TabNavigator({
  Episode: {
    screen: require('./js/TabHomeScreen').default,
    path: /^callback/
  },
  Program: {
    screen: require('./js/TabProgramScreen').default
  }
}, {
  containerConfig: {
    URIPrefix: 'qani://'
  }
});

AppRegistry.registerComponent('quickAnnict', () => quickAnnict);
