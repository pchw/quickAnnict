'use strict';

import React, { Component } from 'react';
import { InteractionManager } from 'react-native';

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
  Icon
} from '@shoutem/ui';

import axios from 'axios';

import config from '../config';
const {
  ANNICT_API_BASE_URL
} = config;

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
      isLoading: false
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
  markWatched(episodeId, rowId) {
    rowId = parseInt(rowId, 10);

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/records`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        episode_id: episodeId
      }
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
  fetchProgram({ accessToken, page, isRefresh }) {
    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/programs`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        filter_unwatched: true,
        sort_started_at: 'desc',
        page: page
      }
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
    this.setState({ page: page });
    this.fetchProgram({
      accessToken: this.state.accessToken,
      page: page
    });
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

  renderRow(program, sectionId, rowId) {
    const work = program.work;
    const episode = program.episode;
    const image = work.images && work.images.facebook.og_image_url
      ? { uri: work.images.facebook.og_image_url }
      : { uri: work.images.recommended_url };
    return (
      <Row styleName="small">
        <Image styleName="small rounded-corners" source={image} />
        <View styleName="vertical stretch sm-gutter-top">
          <Caption styleName="">{work.title}</Caption>
          <Caption styleName="bold">
            {episode.number_text} {episode.title}
          </Caption>
        </View>
        <Button
          styleName="clear"
          onPress={() => {
            this.markWatched.bind(this)(episode.id, rowId);
          }}
        >
          <Icon name="edit" />
        </Button>
      </Row>
    );
  }

  render() {
    return (
      <Screen>
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
