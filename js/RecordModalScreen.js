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
import { ANNICT_COLOR } from './colors';

import { RATINGS, RATING_ICONS, RATING_WORDS } from './ratings';

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
    let iconStyle = {};

    Object.keys(RATINGS).forEach(key => {
      const rating = RATINGS[key];
      if (rating === this.state.ratingState) {
        iconStyle = { backgroundColor: ANNICT_COLOR };
      } else {
        iconStyle = {};
      }
      ratingButtons.push(
        <TouchableOpacity
          key={`modal-button-${rating}`}
          style={[iconStyle, { padding: 5, alignItems: 'center', flex: 1 }]}
          onPress={() => {
            this.changeRating.bind(this)(rating);
          }}
        >
          <FontAwesome name={RATING_ICONS[key]} size={30} />
          <Text adjustsFontSizeToFit={true} minimumFontScale={0.9}>
            {RATING_WORDS[key]}
          </Text>
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
            <View
              style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 3 }}
            >
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
