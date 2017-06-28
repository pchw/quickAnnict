import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';

import config from '../config';
const { ANNICT_API_BASE_URL, OAUTH_ACCESS_TOKEN_KEY } = config;

const STATUS_TABLE = {
  wanna_watch: '見たい',
  watching: '見てる',
  watched: '見た',
  on_hold: '中断',
  stop_watching: '中止',
  no_select: '未指定'
};

// **sample**
// let annict = new Annict({ accessToken: 'XXXXXXX' });
// annict
//   .markWatched({
//     episodeId: 'x',
//     comment: 'xxxxx',
//     ratingState: 'good',
//     isShareOnTwitter: false,
//     isShareOnFacebook: false
//   })
//   .then(() => {})
//   .catch(() => {});
export default class Annict {
  constructor(props) {
    this.state = {
      accessToken: props.accessToken
    };
    this.STATUS_TABLE = STATUS_TABLE;
  }

  getStatusText(status) {
    const message = STATUS_TABLE[status];
    if (!message) {
      return STATUS_TABLE['no_select'];
    }

    return message;
  }

  markWatched({
    episodeId,
    comment,
    ratingState,
    isShareOnTwitter,
    isShareOnFacebook
  }) {
    let postData = {};
    postData.episode_id = episodeId;
    if (ratingState) {
      postData.rating_state = ratingState;
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

    return axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/records`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: postData
    });
  }

  fetchProgram({ page, workId }) {
    let params = {
      filter_unwatched: true,
      sort_started_at: 'desc',
      page: page,
      filter_started_at_lt: moment().utc().format('YYYY/MM/DD HH:mm')
    };

    if (workId) {
      params.filter_work_ids = workId;
    }

    return axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/programs`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      params: params
    });
  }

  fetchWorks({ page, title, season }) {
    let params = {
      sort_season: 'desc',
      sort_watchers_count: 'desc',
      page: page
    };

    if (title) {
      params.filter_title = title;
    }

    if (season) {
      params.filter_season = season;
    }

    return new Promise((resolve, reject) => {
      return axios({
        url: `${ANNICT_API_BASE_URL}/v1/works`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.state.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: params
      }).then(response => {
        this.checkWorksStatus({
          workIds: _.map(response.data.works, 'id')
        }).then(workMap => {
          let works = [];
          response.data.works.forEach(function(work) {
            if (workMap[work.id]) {
              work.status = { kind: workMap[work.id] };
            } else {
              work.status = { kind: 'no_select' };
            }
            works.push(work);
          });

          // TODO: Promise.resolveが必要？
          // catchが必要？
          return resolve({
            works: works,
            isEnd: response.data.works.length === 0
          });
        });
      });
    });
  }
  checkWorksStatus({ workIds }) {
    return axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/works`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        filter_ids: workIds.join(',')
      }
    })
      .then(response => {
        let workMap = {};
        response.data.works.forEach(function(work) {
          workMap[work.id] = work.status.kind;
        });
        return Promise.resolve(workMap);
      })
      .catch(err => {
        Promise.reject(err);
      });
  }
  changeWorkStatus({ workId, status }) {
    const kind = status || 'no_select';
    let body = {
      work_id: workId,
      kind: kind
    };

    return axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/statuses`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: body
    });
  }
  me() {
    return axios({
      url: `${ANNICT_API_BASE_URL}/v1/me`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
