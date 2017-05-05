'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  Modal,
  Switch,
  Button as RNButton,
  Image as RNImage,
  AsyncStorage,
  Keyboard
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import {
  NavigationBar,
  Tile,
  Title,
  Image,
  Caption,
  ListView,
  Row,
  Subtitle,
  View,
  Screen,
  DropDownMenu,
  TouchableOpacity,
  Button,
  Text,
  Icon,
  Overlay,
  Divider,
  Lightbox,
  TextInput
} from '@shoutem/ui';

import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

import * as Keychain from 'react-native-keychain';

import config from '../config';
const { ANNICT_API_BASE_URL } = config;
const ANNICT_COLOR = '#F75D75';

import IonIcon from 'react-native-vector-icons/Ionicons';

export default class ProgramScreen extends React.Component {
  static navigationOptions = {
    title: 'アニメ一覧',
    tabBarLabel: 'アニメ一覧',
    tabBarIcon: ({ tintColor }) => {
      return <IonIcon name="ios-list" size={30} />;
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      accessToken: '',
      page: 1,
      programs: [],
      isLoading: true,
      isEnd: false,
      title: ''
    };
  }

  getAccessToken() {
    return Keychain.getGenericPassword()
      .then(credentials => {
        const token = credentials.password;
        if (token) {
          return Promise.resolve(token);
        } else {
          return Promise.reject(new Error('no token'));
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  componentDidMount() {
    this.getAccessToken()
      .then(token => {
        if (token) {
          this.setState({ accessToken: token });
          this.fetchProgram({
            accessToken: token,
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
    const kind = isWatch ? 'watching' : 'no_select';
    let body = {
      work_id: workId,
      kind: kind
    };

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/statuses`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: body
    })
      .then(response => {
        // 一覧をコピー
        let programs = this.state.programs.slice();
        programs[rowId].status.kind = kind;

        this.setState({
          programs: programs,
          isLoading: false
        });
      })
      .catch(err => {
        console.error(err);
      });
  }

  fetchProgram({ page, isRefresh, title }) {
    let params = {
      sort_season: 'desc',
      sort_watchers_count: 'desc',
      page: page
    };

    // 画面リフレッシュではなくて，既に終端に達している場合は何もしない
    if (!isRefresh && this.state.isEnd) {
      return;
    }

    if (title) {
      params.filter_title = title;
    }

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/works`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      params: params
    })
      .then(response => {
        this.checkStatus({
          workIds: _.map(response.data.works, 'id')
        }).then(workMap => {
          let works = [];
          response.data.works.forEach(function(work) {
            if (workMap[work.id]) {
              work.status = { kind: workMap[work.id] };
            } else {
              work.status = { kind: 'no_select' };
            }
            works.push(work);
          });
          if (isRefresh) {
            this.setState({
              programs: works,
              isLoading: false,
              isEnd: response.data.works.length === 0
            });
          } else {
            this.setState({
              programs: this.state.programs.concat(works),
              isLoading: false,
              isEnd: response.data.works.length === 0
            });
          }
        });
      })
      .catch(err => {
        console.error(err);
      });
  }
  fetchNext() {
    const page = this.state.page + 1;
    this.setState({
      page: page,
      isLoading: true
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
          accessToken: token,
          page: 1,
          isLoading: true,
          isEnd: false
        });
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
          styleName="small rounded-corners"
          source={{ uri: work.images.facebook.og_image_url }}
        />
      );
    } else if (work.images && work.images.recommended_url) {
      image = (
        <Image
          styleName="small rounded-corners"
          source={{ uri: work.images.recommended_url }}
        />
      );
    } else {
      image = (
        <Image
          styleName="small rounded-corners"
          style={{ borderWidth: 1, borderColor: ANNICT_COLOR }}
        >
          <Text>NO IMAGE</Text>
        </Image>
      );
    }

    let button;
    if (work.status.kind === 'watching') {
      button = (
        <Button
          onPress={() => {
            this.changeStatus.bind(this)({
              rowId: rowId,
              workId: work.id,
              isWatch: false
            });
          }}
        >
          <Text>視聴解除</Text>
        </Button>
      );
    } else {
      button = (
        <Button
          styleName="clear"
          onPress={() => {
            this.changeStatus.bind(this)({
              rowId: rowId,
              workId: work.id,
              isWatch: true
            });
          }}
          style={{
            backgroundColor: `${ANNICT_COLOR}`
          }}
        >
          <Text>視聴登録</Text>
        </Button>
      );
    }

    return (
      <Row key={work.id}>
        {image}
        <View styleName="vertical stretch sm-gutter-top">
          <Caption styleName="">{work.title}</Caption>
        </View>
        {button}

      </Row>
    );
  }

  renderHeader() {
    let views = [];

    // リストが空になったときの処理
    if (this.state.programs.length === 0 && !this.state.isLoading) {
      views.push(
        <View styleName="horizontal h-center" style={{ padding: 22 }}>
          <Title>表示できるアニメがありません</Title>
        </View>
      );

      // 絞込が指定されている場合は絞込解除のボタンを出す
      if (this.state.title) {
        views.push(
          <RNButton
            onPress={this.resetFilter.bind(this)}
            title="絞込を解除する"
            color={ANNICT_COLOR}
          />
        );
      } else {
        views.push(
          <View styleName="horizontal h-center">
            <Title>アニメが追加されるのをお待ち下さい</Title>
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
    if (!this.state.accessToken) {
      return (
        <Screen>
          <View styleName="vertical h-center" style={{ padding: 22 }}>
            <Text>この画面ではアニメ一覧から「視聴ているアニメ」「視聴していないアニメ」を管理する事ができます</Text>
            <RNButton
              onPress={this.reload.bind(this)}
              title="一覧を表示する"
              color={ANNICT_COLOR}
            />
          </View>
        </Screen>
      );
    }
    return (
      <Screen>
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
        />
        <ListView
          data={this.state.programs}
          renderRow={this.renderRow.bind(this)}
          onLoadMore={this.fetchNext.bind(this)}
          onRefresh={this.reload.bind(this)}
          loading={this.state.isLoading && !this.state.isEnd}
          renderHeader={this.renderHeader.bind(this)}
        />
      </Screen>
    );
  }
}
