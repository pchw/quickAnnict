import { Constants } from 'expo';

const ANNICT_API_BASE_URL = 'https://api.annict.com';
const ANNICT_OAUTH_AUTHORIZE_URL = `${ANNICT_API_BASE_URL}/oauth/authorize`;
const ANNICT_OAUTH_TOKEN_URL = `${ANNICT_API_BASE_URL}/oauth/token`;
const REDIRECT_URI = `${Constants.linkingUri}callback`;

export default {
  OAUTH_CLIENT_ID: 'input your client id',
  OAUTH_CLIENT_SECRET: 'input your client secret',
  ANNICT_API_BASE_URL: ANNICT_API_BASE_URL,
  ANNICT_OAUTH_AUTHORIZE_URL: ANNICT_OAUTH_AUTHORIZE_URL,
  ANNICT_OAUTH_TOKEN_URL: ANNICT_OAUTH_TOKEN_URL,
  REDIRECT_URI: REDIRECT_URI,
  OAUTH_ACCESS_TOKEN_KEY: 'NSDEFAULT@OAuthAccessTokenKey'
};
