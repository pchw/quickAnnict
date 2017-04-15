'use strict';

import React, { Component } from 'react';
import { InteractionManager, Modal, Switch } from 'react-native';

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

import config from '../config';
const { ANNICT_API_BASE_URL } = config;

import RecordModalScreen from './RecordModalScreen';

export default class EpisodeScreen extends React.Component {
  static navigationOptions = {
    title: 'quickAnnict'
  };

  constructor(props) {
    super(props);

    this.state = {
      accessToken: '',
      page: 1,
      programs: [],
      isLoading: false,
      workId: '',
      isVisiblePopup: false,
      isShareOnTwitter: false,
      isShareOnFacebook: false,
      comment: '',
      rating: 0
    };
  }
  componentDidMount() {
    const { params } = this.props.navigation.state;
    this.setState({ accessToken: params.accessToken });
    this.fetchProgram({
      accessToken: params.accessToken,
      page: this.state.page
    });
  }
  markWatched({
    episodeId,
    rowId,
    comment,
    rating,
    isShareOnTwitter,
    isShareOnFacebook
  }) {
    rowId = parseInt(rowId, 10);

    let postData = {};
    postData.episode_id = episodeId;
    if (rating) {
      postData.rating = rating;
    }
    if (comment) {
      postData.comment = comment;
    }
    if (isShareOnTwitter) {
      postData.share_twitter = 'true';
    }
    if (isShareOnFacebook) {
      postData.share_facebook = 'true';
    }

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/records`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: postData
    })
      .then(response => {
        // チェックを付けたのをListViewから消す
        let programs = this.state.programs.slice();
        programs.splice(rowId, 1);

        this.setState({
          programs: programs
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  fetchProgram({ accessToken, page, isRefresh, workId }) {
    let params = {
      filter_unwatched: true,
      sort_started_at: 'desc',
      page: page,
      filter_started_at_lt: moment().format('YYYY/MM/DD HH:mm')
    };

    if (workId) {
      params.filter_work_ids = workId;
    }

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/programs`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: params
    })
      .then(response => {
        if (isRefresh) {
          this.setState({
            programs: response.data.programs,
            isLoading: false
          });
        } else {
          this.setState({
            programs: this.state.programs.concat(response.data.programs),
            isLoading: false
          });
        }
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
      accessToken: this.state.accessToken,
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
      accessToken: this.state.accessToken,
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
      isLoading: true
    });
    this.fetchProgram({
      accessToken: this.state.accessToken,
      page: 1,
      isRefresh: true
    });
  }

  setPopupVisible(isVisible) {
    this.setState({
      isVisiblePopup: isVisible
    });
  }

  renderRow(program, sectionId, rowId) {
    const work = program.work;
    const episode = program.episode;
    const image = work.images && work.images.facebook.og_image_url
      ? { uri: work.images.facebook.og_image_url }
      : { uri: work.images.recommended_url };
    let filterOverlay;
    if (!this.state.workId) {
      filterOverlay = (
        <TouchableOpacity
          onPress={() => {
            this.filterWorks.bind(this)(work.id);
          }}
        >
          <Overlay
            styleName="solid-bright fill-parent rounded-small"
            style={{ backgroundColor: '#F75D75' }}
          >
            <Icon name="search" />
          </Overlay>
        </TouchableOpacity>
      );
    }
    return (
      <Row styleName="small">

        <Image styleName="small rounded-corners" source={image}>
          {filterOverlay}
        </Image>
        <View styleName="vertical stretch sm-gutter-top">
          <Caption styleName="">{work.title}</Caption>
          <Caption styleName="bold">
            {episode.number_text} {episode.title}
          </Caption>
        </View>
        <Button
          styleName="clear"
          onPress={() => {
            this.markWatched.bind(this)({
              episodeId: episode.id,
              rowId: rowId
            });
          }}
          onLongPress={() => {
            this.setState({
              modalEpisodeId: episode.id,
              modalRowId: rowId,
              modalTitle: work.title,
              modalEpisodeTitle: `${episode.number_text} ${episode.title || ''}`
            });
            this.setPopupVisible.bind(this)(true);
          }}
        >
          <Icon name="edit" />
        </Button>
      </Row>
    );
  }

  render() {
    let removeFilterBar;
    if (this.state.workId) {
      removeFilterBar = (
        <Divider styleName="section-header">
          <View
            styleName="fill-parent horizontal h-center v-center"
            style={{ backgroundColor: '#272822' }}
          >
            <Button styleName="clear" onPress={this.resetFilter.bind(this)}>
              <View styleName="horizontal">
                <Caption styleName="bold" style={{ color: '#f8f8f8' }}>
                  Reset filter ☓
                </Caption>
              </View>
            </Button>
          </View>
        </Divider>
      );
    }

    const modalView = this.state.isVisiblePopup
      ? <RecordModalScreen
          title={this.state.modalTitle}
          episodeTitle={this.state.modalEpisodeTitle}
          onClose={() => {
            this.setPopupVisible.bind(this)(false);
          }}
          onSubmit={param => {
            const {
              rating,
              comment,
              isShareOnTwitter,
              isShareOnFacebook
            } = param;
            this.markWatched({
              episodeId: this.state.modalEpisodeId,
              rowId: this.state.modalRowId,
              rating: rating,
              comment: comment,
              isShareOnTwitter: isShareOnTwitter,
              isShareOnFacebook: isShareOnFacebook
            });
            this.setPopupVisible(false);
          }}
        />
      : void 0;

    return (
      <Screen>
        {modalView}
        {removeFilterBar}
        <ListView
          data={this.state.programs}
          renderRow={this.renderRow.bind(this)}
          onLoadMore={this.fetchNext.bind(this)}
          onRefresh={this.reload.bind(this)}
          loading={this.state.isLoading}
        />
      </Screen>
    );
  }
}
