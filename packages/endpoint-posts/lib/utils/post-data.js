import { Buffer } from "node:buffer";
import { IndiekitError } from "@indiekit/error";
import { mf2tojf2 } from "@paulrobertlloyd/mf2tojf2";
import { fetch } from "undici";

export const getPostData = async (id, micropubEndpoint, accessToken) => {
  const url = Buffer.from(id, "base64").toString("utf8");

  const parameters = new URLSearchParams({
    q: "source",
    url,
  }).toString();

  const endpointResponse = await fetch(`${micropubEndpoint}?${parameters}`, {
    headers: {
      accept: "application/json",
      // TODO: Third-party media endpoint may require a separate token
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!endpointResponse.ok) {
    throw await IndiekitError.fromFetch(endpointResponse);
  }

  const body = await endpointResponse.json();
  const postData = mf2tojf2(body);

  return postData;
};
