import { expect } from "chai";
import request from "supertest";
import app from "../../src/app";

describe("Health Route", () => {
  describe("GET /health", () => {
    it("should return 200 and health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "ok");
      expect(response.body).to.have.property("message", "Server is running");
      expect(response.body).to.have.property("timestamp");
    });

    it("should return valid ISO timestamp", async () => {
      const response = await request(app).get("/health");

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).to.equal(response.body.timestamp);
    });
  });
});
