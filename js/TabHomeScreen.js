import React, { Component } from 'react';
import { AppRegistry } from 'react-native';

import { StackNavigator } from 'react-navigation';

export default StackNavigator({
  Home: {
    screen: require('./HomeScreen').default
  },
  Episode: {
    screen: require('./EpisodeScreen').default
  },
  Oauth: {
    screen: require('./OAuthScreen').default
  }
});
