'use strict';

import React, { Component } from 'react';
import { View, Text, Image, AsyncStorage } from 'react-native';
import { Constants } from 'expo';
import { Ionicons, Octicons, MaterialIcons } from '@expo/vector-icons';

import _ from 'lodash';

import { ANNICT_COLOR } from './colors';
import styles from './styles';
import config from '../config';
const { OAUTH_ACCESS_TOKEN_KEY, ACCESS_TOKEN } = config;
import Annict from './annict';

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
      name: '',
      username: '',
      description: '',
      avatarUrl: '',
      backgroundImageUrl: '',
      recordsCount: 0
    };
    this.annict = null;
  }

  getAccessToken() {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(OAUTH_ACCESS_TOKEN_KEY, (err, token) => {
        if (token || ACCESS_TOKEN) {
          return resolve(token || ACCESS_TOKEN);
        } else {
          return reject(new Error('no token'));
        }
      });
    });
  }

  componentDidMount() {
    this.getAccessToken()
      .then(token => {
        if (token) {
          this.annict = new Annict({ accessToken: token });
          this.annict.me().then(response => {
            const data = response.data;
            this.setState({
              name: data.name,
              username: data.username,
              description: data.description,
              avatarUrl: data.avatar_url,
              backgroundImageUrl: data.background_image_url,
              recordsCount: data.records_count
            });
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'stretch' }}>
        <Text
          style={[
            styles.header,
            { textAlign: 'center', paddingTop: 15 + Constants.statusBarHeight }
          ]}
        >
          quickAnnict
        </Text>
        <View style={{ margin: 20 }}>
          <Text style={[styles.subText, { marginBottom: 5 }]}>App info</Text>
          <View style={{ marginBottom: 20, flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Octicons name="versions" size={50} />
                <View style={{ alignItems: 'center', marginLeft: 20 }}>
                  <Text style={[styles.bigText, styles.boldText]}>
                    {Constants.manifest.version}
                  </Text>
                  <Text style={styles.subText}>Version</Text>
                </View>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="update" size={50} />
                <View style={{ alignItems: 'center', marginLeft: 20 }}>
                  <Text style={[styles.bigText, styles.boldText]}>
                    2017/06/18
                  </Text>
                  <Text style={styles.subText}>Updated</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.subText, { marginBottom: 5 }]}>User info</Text>
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <Image
              source={{ uri: this.state.avatarUrl }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flex: 1,
                marginLeft: 20
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.bigText, styles.boldText]}>
                  {this.state.recordsCount}
                </Text>
                <Text style={styles.subText}>Records</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.bigText, styles.boldText]}>-</Text>
                <Text style={styles.subText}>Watching</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.bigText, styles.boldText]}>-</Text>
                <Text style={styles.subText}>Following</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.bigText, styles.boldText]}>-</Text>
                <Text style={styles.subText}>Followers</Text>
              </View>
            </View>
          </View>
          <View>
            <Text>{this.state.name}</Text>
            <Text>{this.state.description}</Text>
          </View>
        </View>
      </View>
    );
  }
}
