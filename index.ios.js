import Expo from 'expo';
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { StackNavigator, TabNavigator } from 'react-navigation';

const quickAnnict = TabNavigator(
  {
    Episode: {
      screen: require('./js/TabHomeScreen').default,
      path: /^callback/
    },
    Program: {
      screen: require('./js/TabProgramScreen').default
    },
    About: {
      screen: require('./js/AboutScreen').default
    }
  },
  {
    containerConfig: {
      URIPrefix: 'qani://'
    },
    lazy: true
  }
);

Expo.registerRootComponent(quickAnnict);
