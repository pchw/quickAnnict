import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { StackNavigator } from 'react-navigation';

export default StackNavigator({
  Program: {
    screen: require('./ProgramScreen').default
  }
});
