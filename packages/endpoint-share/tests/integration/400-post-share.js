import process from "node:process";
import test from "ava";
import nock from "nock";
import supertest from "supertest";
import { JSDOM } from "jsdom";
import { testServer } from "@indiekit-test/server";

test("Returns 400 error publishing post", async (t) => {
  nock("https://token-endpoint.example").get("/").reply(200, {
    me: process.env.TEST_PUBLICATION_URL,
    scope: "foo",
  });

  const server = await testServer();
  const request = supertest.agent(server);
  const response = await request
    .post("/share")
    .auth(process.env.TEST_TOKEN, { type: "bearer" })
    .send("name=Foobar")
    .send("content=Test+of+sharing+a+bookmark")
    .send("bookmark-of=https://example.website");
  const dom = new JSDOM(response.text);
  const result = dom.window.document;

  t.is(response.status, 400);
  t.is(
    result.querySelector(".notification--error p").textContent,
    "No bearer token provided by request"
  );

  server.close(t);
});
