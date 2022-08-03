import { IndiekitError } from "@indiekit/error";
import validator from "express-validator";
import { fetch } from "undici";
import { getPostData } from "../utils/post-data.js";

const { validationResult } = validator;

export const editController = {
  /**
   * Edit post
   *
   * @param {object} request - HTTP request
   * @param {object} response - HTTP response
   * @returns {object} HTTP response
   */
  async get(request, response) {
    const accessToken = request.session.access_token;
    const { categories, mediaEndpoint, micropubEndpoint, syndicationTargets } =
      request.app.locals.publication;
    const { id } = request.params;
    const post = await getPostData(id, micropubEndpoint, accessToken);

    if (post.published) {
      post["published-local"] = new Date(post.published)
        .toISOString()
        .replace("Z", "");
    }

    const rsvpItems = ["yes", "no", "maybe", "interested"].map((value) => ({
      text: response.__(`posts.post.rsvp.${value}`),
      value,
      checked: post.rsvp === value,
    }));

    const targetItems = syndicationTargets.map((target) => ({
      text: target.info.service.name,
      hint: { text: target.info.uid },
      value: target.info.uid,
      checked: target.options.checked,
    }));

    const visibilityItems = ["public", "unlisted", "private"].map((value) => ({
      text: response.__(`posts.post.visibility.${value}`),
      value,
      checked: post.visibility === value,
    }));

    response.render("edit", {
      title: response.__("posts.edit.title"),
      post,
      categories,
      mediaEndpoint,
      rsvpItems,
      targetItems,
      visibilityItems,
    });
  },

  /**
   * Save changes
   *
   * @param {object} request - HTTP request
   * @param {object} response - HTTP response
   * @returns {object} HTTP response
   */
  async post(request, response) {
    const { publication } = request.app.locals;

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).render("edit", {
        title: response.__("posts.edit.title"),
        errors: errors.mapped(),
      });
    }

    // TODO: Add time zone to published date

    try {
      const endpointResponse = await fetch(publication.mediaEndpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          // TODO: Third-party media endpoint may require a separate token
          authorization: `Bearer ${request.session.access_token}`,
        },
        body: request.body,
      });

      if (!endpointResponse.ok) {
        throw await IndiekitError.fromFetch(endpointResponse);
      }

      const body = await endpointResponse.json();
      const message = encodeURIComponent(body.success_description);

      response.redirect(`${request.baseUrl}?success=${message}`);
    } catch (error) {
      response.status(error.status || 500);
      response.render("edit", {
        title: response.__("posts.edit.title"),
        error: error.message,
      });
    }
  },
};
