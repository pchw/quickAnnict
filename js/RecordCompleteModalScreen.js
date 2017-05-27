'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  Modal,
  Switch,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  Text,
  TextInput
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import _ from 'lodash';

import styles from './styles';

export default class RecordCompleteModalScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      doNotDisplayAgain: this.props.doNotDisplayAgain
    };
    console.log(this.state.doNotDisplayAgain);
  }

  onSubmit() {
    this.props.onSubmit({
      isDisplayRecordComplete: !this.state.doNotDisplayAgain
    });
  }

  render() {
    return (
      <Modal
        animationType={'fade'}
        transparent={false}
        visible={true}
        style={{ alignItems: 'flex-start' }}
      >
        <View style={{ flex: 1, padding: 22 }}>
          <Text style={{ alignSelf: 'center' }}>視聴記録が完了しました</Text>
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
          <Text style={{ marginBottom: 22 }}>
            を視聴記録しました
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 5
            }}
          >
            <Text>次回以降はこの画面を表示しない</Text>
            <Switch
              onValueChange={val => this.setState({ doNotDisplayAgain: val })}
              value={this.state.doNotDisplayAgain}
            />
          </View>

          <TouchableOpacity
            style={styles.regularButton}
            onPress={this.onSubmit.bind(this)}
          >
            <Text>設定を保存して閉じる</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}
