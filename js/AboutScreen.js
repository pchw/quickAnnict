'use strict';

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  AsyncStorage,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Constants, Util } from 'expo';
import { Ionicons, Octicons, MaterialIcons } from '@expo/vector-icons';

import _ from 'lodash';

import { ANNICT_COLOR } from './colors';
import styles from './styles';
import config from '../config';
const { OAUTH_ACCESS_TOKEN_KEY, ACCESS_TOKEN } = config;
import Annict from './annict';

const releases = [
  {
    id: '2017-06-28-1',
    date: '2017/06/28',
    body: '視聴状態を見てる以外も選べるようになりました'
  },
  {
    id: '2017-06-26-1',
    date: '2017/06/26',
    body: '夏アニメで絞りこめるようになりました'
  },
  {
    id: '2017-06-26-2',
    date: '2017/06/26',
    body: '内部ライブラリをアップデートしました'
  },
  {
    id: '2017-06-20-1',
    date: '2017/06/20',
    body: 'ログアウトボタンを追加しました'
  }
];

export default class AboutScreen extends React.Component {
  static navigationOptions = {
    tabBarLabel: '情報',
    tabBarIcon: ({ tintColor }) =>
      <Ionicons name="ios-information-circle" size={30} color={tintColor} />
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

  logout() {
    AsyncStorage.removeItem(OAUTH_ACCESS_TOKEN_KEY, () => {
      this.props.navigation.dispatch(
        NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Episode'
            })
          ]
        })
      );
    });
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

  renderRow(info) {
    const release = info.item;
    return (
      <View style={{ marginBottom: 5 }}>
        <Text>{release.date}</Text>
        <Text style={{ marginLeft: 5 }}>{release.body}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'stretch' }}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { textAlign: 'center' }]}>
            quickAnnict
          </Text>
        </View>
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
                    2017/06/28
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
          <View style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={styles.regularButton}
              onPress={this.logout.bind(this)}
            >
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.subText, { marginTop: 20, marginBottom: 5 }]}>
            Releases
          </Text>
          <FlatList
            data={releases}
            renderItem={this.renderRow.bind(this)}
            keyExtractor={item => {
              return `releases-${item.id}`;
            }}
          />
        </View>
      </View>
    );
  }
}
