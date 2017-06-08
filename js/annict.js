import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';

import config from '../config';
const { ANNICT_API_BASE_URL, OAUTH_ACCESS_TOKEN_KEY } = config;

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

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/programs`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      params: params
    });
  }

  fetchWorks({ page, title }) {
    let params = {
      sort_season: 'desc',
      sort_watchers_count: 'desc',
      page: page
    };

    if (title) {
      params.filter_title = title;
    }

    axios({
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
        return { works: works };
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
  changeWorkStatus({ workId, isWatch }) {
    const kind = isWatch ? 'watching' : 'no_select';
    let body = {
      work_id: workId,
      kind: kind
    };

    axios({
      url: `${ANNICT_API_BASE_URL}/v1/me/statuses`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: body
    });
  }
}
