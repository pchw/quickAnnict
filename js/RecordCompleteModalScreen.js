'use strict';

import React, { Component } from 'react';
import {
  InteractionManager,
  Modal,
  Switch,
  KeyboardAvoidingView
} from 'react-native';

import {
  Title,
  Caption,
  Subtitle,
  View,
  Button,
  Text,
  Icon,
  TextInput
} from '@shoutem/ui';

import _ from 'lodash';

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
          <Button
            styleName="clear"
            style={{ alignSelf: 'flex-end' }}
            onPress={this.props.onClose}
          >
            <Icon name="close" />
          </Button>
          <Title>{this.props.title}</Title>
          <Subtitle style={{ marginBottom: 10 }}>
            {this.props.episodeTitle}
          </Subtitle>
          <Subtitle style={{ marginBottom: 22 }}>
            を視聴記録しました
          </Subtitle>
          <Caption>次回以降はこの画面を表示しない</Caption>
          <Switch
            onValueChange={val => this.setState({ doNotDisplayAgain: val })}
            value={this.state.doNotDisplayAgain}
          />

          <Button styleName="md-gutter-top" onPress={this.onSubmit.bind(this)}>
            <Text>設定を保存して閉じる</Text>
          </Button>
        </View>
      </Modal>
    );
  }
}
