import { getPostData } from "../utils/post-data.js";

/**
 * View previously published post
 *
 * @param {object} request - HTTP request
 * @param {object} response - HTTP response
 * @param {Function} next - Next middleware callback
 * @returns {object} HTTP response
 */
export const postController = async (request, response, next) => {
  try {
    const accessToken = request.session.access_token;
    const { micropubEndpoint } = request.app.locals.publication;
    const { id } = request.params;
    const post = await getPostData(id, micropubEndpoint, accessToken);

    response.render("post", {
      title: post.name,
      post,
      parent: response.__("posts.posts.title"),
    });
  } catch (error) {
    next(error);
  }
};
