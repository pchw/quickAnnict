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

import _ from 'lodash';

export default class RecordModalScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShareOnTwitter: false,
      isShareOnFacebook: false,
      comment: '',
      rating: 0
    };
  }

  changeRating(rating) {
    if (rating === this.state.rating) {
      this.setState({ rating: 0 });
    } else {
      this.setState({ rating: rating });
    }
  }

  onSubmit() {
    this.props.onSubmit({
      rating: this.state.rating,
      comment: this.state.comment,
      isShareOnTwitter: this.state.isShareOnTwitter,
      isShareOnFacebook: this.state.isShareOnFacebook
    });
  }

  render() {
    let ratingButtons = [];
    let iconName = 'add-to-favorites';

    _.range(5).forEach(i => {
      const rate = i + 1;
      if (this.state.rating >= rate) {
        iconName = 'add-to-favorites-full';
      } else {
        iconName = 'add-to-favorites';
      }
      ratingButtons.push(
        <Button
          key={`modal-button-${rate}`}
          styleName="clear"
          style={{ padding: 0 }}
          onPress={() => {
            this.changeRating.bind(this)(rate);
          }}
        >
          <Icon name={iconName} />
        </Button>
      );
    });

    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={true}
        style={{ alignItems: 'flex-start' }}
      >
        <View style={{ flex: 1, padding: 22 }}>
          <Text style={{ alignSelf: 'center' }}>Record details</Text>
          <Button
            styleName="clear"
            style={{ alignSelf: 'flex-end' }}
            onPress={this.props.onClose}
          >
            <Icon name="close" />
          </Button>
          <Caption>Rating:</Caption>
          <View styleName="horizontal sm-gutter-bottom">
            {ratingButtons}
          </View>
          <Caption>Share on twitter:</Caption>
          <Switch
            onValueChange={val => this.setState({ isShareOnTwitter: val })}
            value={this.state.isShareOnTwitter}
          />
          <Caption>Share on facebook:</Caption>
          <Switch
            onValueChange={val => this.setState({ isShareOnFacebook: val })}
            value={this.state.isShareOnFacebook}
          />
          <Caption>Comment:</Caption>
          <TextInput
            multiline={true}
            style={{
              flex: 9,
              borderColor: '#000000',
              borderStyle: 'solid',
              borderWidth: 1,
              borderRadius: 3
            }}
          />
          <Button styleName="md-gutter-top" onPress={this.onSubmit.bind(this)}>
            <Text>Record</Text>
          </Button>
        </View>
      </Modal>
    );
  }
}
