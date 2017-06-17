'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  Modal,
  Switch,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  Text,
  TextInput
} from 'react-native';
import { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import _ from 'lodash';

import { ANNICT_COLOR } from './colors';
import styles from './styles';

export default class AboutScreen extends React.Component {
  static navigationOptions = {
    tabBarLabel: '情報',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-information-circle" size={30} color={tintColor} />
    )
  };

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'stretch' }}>
        <Text style={[styles.header, {textAlign: 'center', paddingTop: 15+Constants.statusBarHeight}]}>quickAnnict</Text>
        <View style={{margin: 20}}>
          <Text>Version: {Constants.manifest.version}</Text>
          <Text>Updated at: 2017/06/17</Text>
        </View>
      </View>
    );
  }
}
