const normalizeUrl = require('normalize-url');

const request = require(process.env.PWD + '/app/lib/indieauth/request');

/**
 * Verifies that a token provides permissions to post to configured publication
 *
 * @memberof indieauth
 * @module verifyToken
 * @param {String} accessToken Access token
 * @param {String} url Publication URL
 * @returns {Promise} Token endpoint reponse object
 */
module.exports = async (accessToken, url) => {
  const response = await request(accessToken);

  /* @todo Check if all clients support authResponse.error */
  if (response.error) {
    throw new Error(response.error_description);
  }

  const isAuthenticated = normalizeUrl(response.me) === normalizeUrl(url);
  if (!isAuthenticated) {
    throw new Error(`${url} does not match that provided by token`);
  }

  return response;
};
