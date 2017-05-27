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

import { Ionicons } from '@expo/vector-icons';

import _ from 'lodash';

import styles from './styles';

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
    let iconName = 'ios-star-outline';

    _.range(5).forEach(i => {
      const rate = i + 1;
      if (this.state.rating >= rate) {
        iconName = 'ios-star';
      } else {
        iconName = 'ios-star-outline';
      }
      ratingButtons.push(
        <TouchableOpacity
          key={`modal-button-${rate}`}
          style={{ padding: 0 }}
          onPress={() => {
            this.changeRating.bind(this)(rate);
          }}
        >
          <Ionicons name={iconName} size={30} />
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
