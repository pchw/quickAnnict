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
  fetchProgram({ accessToken, page }) {
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
        this.setState({
          programs: this.state.programs.concat(response.data.programs)
        });
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

  renderRow(program) {
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
        <Button styleName="clear">
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
          loading={this.state.isLoading}
        />
      </Screen>
    );
  }
}
