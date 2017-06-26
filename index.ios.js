import Expo from 'expo';
import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { StackNavigator, TabNavigator } from 'react-navigation';

const quickAnnict = TabNavigator(
  {
    Episode: {
      screen: require('./js/TabHomeScreen').default
    },
    Program: {
      screen: require('./js/ProgramScreen').default
    },
    About: {
      screen: require('./js/AboutScreen').default
    }
  },
  {
    lazy: true
  }
);

Expo.registerRootComponent(quickAnnict);
