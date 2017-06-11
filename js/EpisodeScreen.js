'use strict';

import React, { Component } from 'react';
import {
  Button,
  AsyncStorage,
  Image,
  ListView,
  TouchableOpacity,
  Text,
  View,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { NavigationActions } from 'react-navigation';

import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

import { Ionicons } from '@expo/vector-icons';

import config from '../config';
const { ANNICT_API_BASE_URL, OAUTH_ACCESS_TOKEN_KEY } = config;
import styles from './styles';
import { ANNICT_COLOR } from './colors';
import { RATINGS } from './ratings';
import uuid from './guid';
const MODAL_TYPE = {
  RECORD_DETAIL: 'record_detail',
  RECORD_COMPLETE: 'record_complete'
};
const IS_DISPLAY_RECORD_COMPLETE_KEY = 'NSDEFAULT@isDisplayRecordComplete';

import RecordModalScreen from './RecordModalScreen';
import RecordCompleteModalScreen from './RecordCompleteModalScreen';

import Annict from './annict';

export default class EpisodeScreen extends React.Component {
  static navigationOptions = {
    title: 'quickAnnict',
    headerStyle: {
      backgroundColor: ANNICT_COLOR
    },
    tabBarLabel: '視聴記録',
    tabBarIcon: ({ tintColor }) => (
      <Ionicons name="ios-eye" size={30} color={tintColor} />
    )
  };

  constructor(props) {
    super(props);

    this.annict = null;
    this.state = {
      page: 1,
      programs: [],
      isLoading: false,
      isEnd: false,
      workId: '',
      modalType: MODAL_TYPE.RECORD_COMPLETE,
      isVisiblePopup: false,
      isShareOnTwitter: false,
      isShareOnFacebook: false,
      comment: '',
      ratingState: RATINGS.AVERAGE,
      isDisplayRecordComplete: true,
      errorMessage: '',
      dataSourcePrograms: new ListView.DataSource({
        rowHasChanged: (r, l) => {
          r !== l;
        }
      })
    };

    AsyncStorage.getItem(IS_DISPLAY_RECORD_COMPLETE_KEY, (err, param) => {
      if (param) {
        param = JSON.parse(param);
      }
      if (!param || param.isDisplayRecordComplete) {
        this.setState({
          isDisplayRecordComplete: true
        });
      } else {
        this.setState({
          isDisplayRecordComplete: false
        });
      }
    });
  }

  componentDidMount() {
    const { params } = this.props.navigation.state;

    this.annict = new Annict({ accessToken: params.accessToken });
    this.fetchProgram({
      page: this.state.page
    });
  }
  logout() {
    AsyncStorage.removeItem(OAUTH_ACCESS_TOKEN_KEY, () => {
      this.props.navigation.dispatch(
        NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Home'
            })
          ]
        })
      );
    });
  }
  markWatched({
    episodeId,
    rowId,
    comment,
    ratingState,
    isShareOnTwitter,
    isShareOnFacebook
  }) {
    rowId = parseInt(rowId, 10);

    this.annict
      .markWatched({
        episodeId,
        comment,
        ratingState,
        isShareOnTwitter,
        isShareOnFacebook
      })
      .then(response => {
        // チェックを付けたのをListViewから消す
        let programs = this.state.programs.slice();
        programs.splice(rowId, 1);

        this.setState({
          dataSourcePrograms: new ListView.DataSource({
            rowHasChanged: (r, l) => {
              r !== l;
            }
          }).cloneWithRows(programs),
          programs: programs,
          isLoading: false,
          errorMessage: ''
        });

        this.setPopupVisible(true, MODAL_TYPE.RECORD_COMPLETE);
      })
      .catch(error => {
        this.setState({
          errorMessage: 'Annictとの通信に失敗しました。しばらく時間を置いてから再度記録ボタンを押して下さい。'
        });
        console.error(error);
      });
  }
  fetchProgram({ page, isRefresh, workId }) {
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
      .fetchProgram({ page, workId })
      .then(response => {
        const programs = response.data.programs;
        if (isRefresh) {
          this.setState({
            dataSourcePrograms: new ListView.DataSource({
              rowHasChanged: (r, l) => {
                r !== l;
              }
            }).cloneWithRows(programs),
            programs: programs,
            isLoading: false,
            errorMessage: '',
            isEnd: programs.length === 0
          });
        } else {
          this.setState({
            programs: this.state.programs.concat(programs),
            dataSourcePrograms: this.state.dataSourcePrograms.cloneWithRows(
              this.state.programs.concat(programs)
            ),
            isLoading: false,
            errorMessage: '',
            isEnd: programs.length === 0
          });
        }
      })
      .catch(err => {
        this.setState({
          errorMessage: 'Annictとの通信に失敗しました。しばらく時間を置いてから再度読み込み直して下さい。',
          isLoading: false
        });
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
      workId: this.state.workId
    });
  }
  filterWorks(workId) {
    this.setState({
      page: 1,
      workId: workId
    });
    this.fetchProgram({
      page: 1,
      workId: workId,
      isRefresh: true
    });
  }
  resetFilter() {
    this.filterWorks('');
  }

  reload() {
    this.setState({
      page: 1,
      isEnd: false
    });
    this.fetchProgram({
      page: 1,
      workId: this.state.workId,
      isRefresh: true
    });
  }

  setPopupVisible(isVisible, type) {
    this.setState({
      isVisiblePopup: isVisible,
      modalType: type
    });
  }

  renderRow(program, sectionId, rowId) {
    const work = program.work;
    const episode = program.episode;
    const image = work.images && work.images.facebook.og_image_url
      ? { uri: work.images.facebook.og_image_url }
      : { uri: work.images.recommended_url };

    return (
      <View style={styles.episodeRow} key={`episode-${episode.id}`}>
        <TouchableOpacity
          onPress={() => {
            this.filterWorks.bind(this)(work.id);
          }}
          style={styles.episodeRowSelectable}
        >
          <Image style={styles.episodeRowThumbnail} source={image} />
          <View style={styles.episodeRowBody}>
            <Text style={styles.episodeRowText}>{work.title}</Text>
            <Text style={[styles.episodeRowText, styles.boldText]}>
              {episode.number_text} {episode.title}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.episodeRowAction}
          onPress={() => {
            this.markWatched.bind(this)({
              episodeId: episode.id,
              rowId: rowId
            });
            this.setState({
              modalEpisodeId: episode.id,
              modalRowId: rowId,
              modalTitle: work.title,
              modalEpisodeTitle: `${episode.number_text} ${episode.title || ''}`
            });
            this.setPopupVisible.bind(this)(true, MODAL_TYPE.RECORD_COMPLETE);
          }}
          onLongPress={() => {
            this.setState({
              modalEpisodeId: episode.id,
              modalRowId: rowId,
              modalTitle: work.title,
              modalEpisodeTitle: `${episode.number_text} ${episode.title || ''}`
            });
            this.setPopupVisible.bind(this)(true, MODAL_TYPE.RECORD_DETAIL);
          }}
        >
          <Ionicons name="ios-create-outline" size={30} />
        </TouchableOpacity>
      </View>
    );
  }

  renderHeader() {
    let views = [];
    if (this.state.workId) {
      views.push(
        <View key={uuid()} style={styles.resetFilterHeader}>
          <Button
            onPress={this.resetFilter.bind(this)}
            title="Reset filter ☓"
            color={'#222222'}
          />
        </View>
      );
    }

    // リストが空になったときの処理
    if (this.state.programs.length === 0 && !this.state.isLoading) {
      views.push(
        <View key={uuid()} style={{ margin: 22 }}>
          <Text>表示できるアニメがありません</Text>
        </View>
      );

      // 絞込が指定されている場合は絞込解除のボタンを出す
      if (this.state.workId) {
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
            <Text>次の放送日をお待ち下さい</Text>
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

  renderFooter() {
    let loadingView;
    if (
      this.state.programs.length > 0 &&
      this.state.isLoading &&
      !this.state.isEnd
    ) {
      loadingView = (
        <View>
          <ActivityIndicator animating={true} color={ANNICT_COLOR} />
        </View>
      );
    }
    return loadingView;
  }

  render() {
    let errorView;
    if (this.state.errorMessage) {
      errorView = (
        <View style={{ padding: 22 }}>
          <Text>{this.state.errorMessage}</Text>
          <View style={{ marginTop: 22 }}>
            <Button
              onPress={this.reload.bind(this)}
              title="再読込する"
              color={ANNICT_COLOR}
            />
          </View>
        </View>
      );
    }

    let modalView = void 0;
    if (this.state.isVisiblePopup) {
      switch (this.state.modalType) {
        case MODAL_TYPE.RECORD_DETAIL: {
          modalView = (
            <RecordModalScreen
              title={this.state.modalTitle}
              episodeTitle={this.state.modalEpisodeTitle}
              doNotDisplayAgain={!this.state.isDisplayRecordComplete}
              onClose={() => {
                this.setPopupVisible.bind(this)(false);
              }}
              onSubmit={param => {
                const {
                  ratingState,
                  comment,
                  isShareOnTwitter,
                  isShareOnFacebook
                } = param;
                this.markWatched({
                  episodeId: this.state.modalEpisodeId,
                  rowId: this.state.modalRowId,
                  ratingState: ratingState,
                  comment: comment,
                  isShareOnTwitter: isShareOnTwitter,
                  isShareOnFacebook: isShareOnFacebook
                });
                this.setPopupVisible(true, MODAL_TYPE.RECORD_COMPLETE);
              }}
            />
          );
          break;
        }
        case MODAL_TYPE.RECORD_COMPLETE: {
          if (!this.state.isDisplayRecordComplete) {
            break;
          }
          modalView = (
            <RecordCompleteModalScreen
              title={this.state.modalTitle}
              episodeTitle={this.state.modalEpisodeTitle}
              onClose={() => {
                this.setPopupVisible.bind(this)(false);
              }}
              onSubmit={param => {
                const { isDisplayRecordComplete } = param;
                // 保存処理
                AsyncStorage.setItem(
                  IS_DISPLAY_RECORD_COMPLETE_KEY,
                  JSON.stringify({
                    isDisplayRecordComplete: isDisplayRecordComplete
                  }),
                  () => {
                    this.setState({
                      isDisplayRecordComplete: isDisplayRecordComplete
                    });
                    this.setPopupVisible(false);
                  }
                );
              }}
            />
          );
          break;
        }
      }
    }

    return (
      <View style={styles.screen}>
        {errorView}
        {modalView}
        <ListView
          removeClippedSubviews={false}
          dataSource={this.state.dataSourcePrograms}
          renderRow={this.renderRow.bind(this)}
          renderFooter={this.renderFooter.bind(this)}
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
    );
  }
}
