'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  Modal,
  Switch,
  KeyboardAvoidingView,
  View,
  Text,
  TouchableOpacity,
  TextInput
} from 'react-native';

import { Ionicons, FontAwesome } from '@expo/vector-icons';

import _ from 'lodash';

import styles from './styles';

import { RATINGS, RATING_ICONS } from './ratings';

export default class RecordModalScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShareOnTwitter: false,
      isShareOnFacebook: false,
      comment: '',
      ratingState: RATINGS.AVERAGE
    };
  }

  changeRating(rating) {
    if (rating === this.state.ratingState) {
      this.setState({ ratingState: RATINGS.AVERAGE });
    } else {
      this.setState({ ratingState: rating });
    }
  }

  onSubmit() {
    this.props.onSubmit({
      ratingState: this.state.ratingState,
      comment: this.state.comment,
      isShareOnTwitter: this.state.isShareOnTwitter,
      isShareOnFacebook: this.state.isShareOnFacebook
    });
  }

  render() {
    let ratingButtons = [];
    let iconName = 'off';

    Object.keys(RATINGS).forEach(key => {
      const rating = RATINGS[key];
      if (rating === this.state.ratingState) {
        iconName = 'on';
      } else {
        iconName = 'off';
      }
      ratingButtons.push(
        <TouchableOpacity
          key={`modal-button-${rating}`}
          style={{ padding: 0 }}
          onPress={() => {
            this.changeRating.bind(this)(rating);
          }}
        >
          <Ionicons name={RATING_ICONS[key][iconName]} size={30} />
          <Text>{key}</Text>
        </TouchableOpacity>
      );
    });

    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={true}
        style={{ alignItems: 'flex-start' }}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 22 }}>
            <Text style={{ alignSelf: 'center' }}>Record details</Text>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end' }}
              onPress={this.props.onClose}
            >
              <Ionicons name="ios-close" size={30} />
            </TouchableOpacity>
            <Text>{this.props.title}</Text>
            <Text style={{ marginBottom: 10 }}>
              {this.props.episodeTitle}
            </Text>
            <Text>Rating:</Text>
            <View style={{ flexDirection: 'row' }}>
              {ratingButtons}
            </View>
            <Text>Share on twitter:</Text>
            <Switch
              onValueChange={val => this.setState({ isShareOnTwitter: val })}
              value={this.state.isShareOnTwitter}
            />
            <Text>Share on facebook:</Text>
            <Switch
              onValueChange={val => this.setState({ isShareOnFacebook: val })}
              value={this.state.isShareOnFacebook}
            />
            <Text>Comment:</Text>
            <TextInput
              multiline={true}
              style={{
                flex: 9,
                borderColor: '#000000',
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: 3,
                marginBottom: 5,
                padding: 10
              }}
              onChangeText={comment => {
                this.setState({ comment: comment });
              }}
            />
            <TouchableOpacity
              style={[styles.regularButton, { alignItems: 'center' }]}
              onPress={this.onSubmit.bind(this)}
            >
              <Text>Record</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}
