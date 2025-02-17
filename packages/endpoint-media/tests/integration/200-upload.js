import process from "node:process";
import test from "ava";
import supertest from "supertest";
import { mockAgent } from "@indiekit-test/mock-agent";
import { getFixture } from "@indiekit-test/fixtures";
import { testServer } from "@indiekit-test/server";

await mockAgent("store");

test("Uploads file", async (t) => {
  const server = await testServer();
  const request = supertest.agent(server);
  const result = await request
    .post("/media")
    .auth(process.env.TEST_TOKEN, { type: "bearer" })
    .set("accept", "application/json")
    .attach("file", getFixture("file-types/photo.jpg", false), "photo.jpg");

  t.is(result.status, 201);
  t.regex(result.headers.location, /\b.jpg\b/);
  t.regex(result.body.success_description, /\bMedia uploaded\b/);

  server.close(t);
});
