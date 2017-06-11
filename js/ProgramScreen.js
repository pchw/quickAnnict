'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  Modal,
  Switch,
  Button,
  Image,
  AsyncStorage,
  Keyboard,
  ListView,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  RefreshControl
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import uuid from './guid';

import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import styles from './styles';

import config from '../config';
const { ANNICT_API_BASE_URL, OAUTH_ACCESS_TOKEN_KEY, ACCESS_TOKEN } = config;
import { ANNICT_COLOR, GUNJYO } from './colors';

import { Ionicons } from '@expo/vector-icons';

import Annict from './annict';

export default class ProgramScreen extends React.Component {
  static navigationOptions = {
    title: 'アニメ一覧',
    tabBarLabel: 'アニメ一覧',
    tabBarIcon: ({ tintColor }) => {
      return <Ionicons name="ios-list" size={30} color={tintColor} />;
    },
    headerStyle: {
      backgroundColor: ANNICT_COLOR
    }
  };

  constructor(props) {
    super(props);

    this.annict = null;
    this.state = {
      page: 1,
      programs: [],
      dataSourcePrograms: new ListView.DataSource({
        rowHasChanged: (r, l) => {
          r !== l;
        }
      }),
      isLoading: false,
      isEnd: false,
      title: ''
    };
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
          this.fetchProgram({
            page: this.state.page
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  checkStatus({ workIds }) {
    return axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/works`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        filter_ids: workIds.join(',')
      }
    })
      .then(response => {
        let workMap = {};
        response.data.works.forEach(function(work) {
          workMap[work.id] = work.status.kind;
        });
        return Promise.resolve(workMap);
      })
      .catch(err => {
        Promise.reject(err);
      });
  }

  changeStatus({ rowId, workId, isWatch }) {
    rowId = parseInt(rowId, 10);
    this.annict
      .changeWorkStatus({ workId, isWatch })
      .then(response => {
        // 一覧をコピー
        let programs = this.state.programs.slice();
        programs[rowId].status.kind = kind;

        this.setState({
          programs: programs,
          dataSourcePrograms: new ListView.DataSource({
            rowHasChanged: (r, l) => {
              r !== l;
            }
          }).cloneWithRows(programs),
          isLoading: false
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  fetchProgram({ page, isRefresh, title }) {
    // ローディング中は二重に取れないようにする
    if (this.state.isLoading) {
      return;
    }

    // 画面リフレッシュではなくて，既に終端に達している場合は何もしない
    if (!isRefresh && this.state.isEnd) {
      return;
    }

    this.setState({ isLoading: true });

    this.annict
      .fetchWorks({ page, title })
      .then(({ works, isEnd }) => {
        if (isRefresh) {
          this.setState({
            programs: works,
            dataSourcePrograms: new ListView.DataSource({
              rowHasChanged: (r, l) => {
                r !== l;
              }
            }).cloneWithRows(works),
            isLoading: false,
            isEnd: isEnd
          });
        } else {
          this.setState({
            programs: this.state.programs.concat(works),
            dataSourcePrograms: this.state.dataSourcePrograms.cloneWithRows(
              this.state.programs.concat(works)
            ),
            isLoading: false,
            isEnd: isEnd
          });
        }
      })
      .catch(err => {
        this.setState({ isLoading: false });
        console.error(err);
      });
  }
  fetchNext() {
    const page = this.state.page + 1;
    this.setState({
      page: page
    });
    this.fetchProgram({
      page: page,
      title: this.state.title
    });
  }
  filterWorks(title) {
    this.setState({
      page: 1,
      title: title
    });
    this.fetchProgram({
      page: 1,
      title: title,
      isRefresh: true
    });
  }
  resetFilter() {
    this.filterWorks('');
  }

  reload() {
    this.getAccessToken()
      .then(token => {
        this.setState({
          page: 1,
          isEnd: false
        });
        this.annict = new Annict({ accessToken: token });
        this.fetchProgram({
          page: 1,
          title: this.state.title,
          isRefresh: true
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  renderRow(program, sectionId, rowId) {
    const work = program;
    let image;
    if (work.images && work.images.facebook.og_image_url) {
      image = (
        <Image
          style={styles.programRowThumbnail}
          source={{ uri: work.images.facebook.og_image_url }}
        />
      );
    } else if (work.images && work.images.recommended_url) {
      image = (
        <Image
          style={styles.programRowThumbnail}
          source={{ uri: work.images.recommended_url }}
        />
      );
    } else {
      image = (
        <Image style={[styles.programRowThumbnail, styles.programRowNoImage]}>
          <Text style={{ textAlign: 'center' }}>NO IMAGE</Text>
        </Image>
      );
    }

    let button;
    if (work.status.kind === 'watching') {
      button = (
        <TouchableOpacity
          style={[styles.regularButton, { backgroundColor: GUNJYO }]}
          onPress={() => {
            this.changeStatus.bind(this)({
              rowId: rowId,
              workId: work.id,
              isWatch: false
            });
          }}
        >
          <Text style={styles.regularText}>視聴解除</Text>
        </TouchableOpacity>
      );
    } else {
      button = (
        <TouchableOpacity
          style={[styles.regularButton]}
          onPress={() => {
            this.changeStatus.bind(this)({
              rowId: rowId,
              workId: work.id,
              isWatch: true
            });
          }}
        >
          <Text style={styles.regularText}>視聴登録</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View key={`program-${work.id}`} style={styles.programRow}>
        {image}
        <View style={styles.programRowBody}>
          <Text>{work.title}</Text>
          <Text style={styles.subText}>Watchers: {work.watchers_count}</Text>
        </View>
        <View style={styles.programRowAction}>
          {button}
        </View>

      </View>
    );
  }

  renderHeader() {
    let views = [];

    // リストが空になったときの処理
    if (this.state.programs.length === 0 && !this.state.isLoading) {
      views.push(
        <View key={uuid()} style={{ margin: 22 }}>
          <Text>表示できるアニメがありません</Text>
        </View>
      );

      // 絞込が指定されている場合は絞込解除のボタンを出す
      if (this.state.title) {
        views.push(
          <Button
            onPress={this.resetFilter.bind(this)}
            title="絞込を解除する"
            color={ANNICT_COLOR}
          />
        );
      } else {
        views.push(
          <View key={uuid()} style={{ margin: 22 }}>
            <Text>アニメが追加されるのをお待ち下さい</Text>
          </View>
        );
      }
    }

    return (
      <View>
        {views}
      </View>
    );
  }

  render() {
    if (!this.annict) {
      return (
        <View>
          <View style={{ padding: 22 }}>
            <Text>この画面ではアニメ一覧から「視聴しているアニメ」「視聴していないアニメ」を管理する事ができます</Text>
            <Button
              onPress={this.reload.bind(this)}
              title="一覧を表示する"
              color={ANNICT_COLOR}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.screen}>
        <TextInput
          value={this.state.title}
          placeholder="アニメタイトルで絞込み"
          clearButtonMode="always"
          onChangeText={text => {
            this.filterWorks(text);
          }}
          onBlur={() => {
            Keyboard.dismiss();
          }}
          style={[styles.programSearch, { flex: 1 }]}
        />
        <View style={{ flex: 10 }}>
          <ListView
            removeClippedSubviews={false}
            dataSource={this.state.dataSourcePrograms}
            renderRow={this.renderRow.bind(this)}
            onEndReached={this.fetchNext.bind(this)}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isLoading && !this.state.isEnd}
                onRefresh={this.reload.bind(this)}
              />
            }
            renderHeader={this.renderHeader.bind(this)}
          />
        </View>
      </View>
    );
  }
}
