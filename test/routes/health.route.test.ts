/**
 * Health Route Integration Tests
 *
 * Tests the /health endpoint using Supertest (no actual HTTP server)
 */

import { expect } from "chai";
import request from "supertest";
import app from "../../src/app";

describe("Health Route", () => {
  describe("GET /health", () => {
    it("should return 200 and health status", async () => {
      // Act
      const response = await request(app).get("/health");

      // Assert
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("status", "ok");
      expect(response.body).to.have.property("message", "Server is running");
      expect(response.body).to.have.property("timestamp");
    });

    it("should return valid ISO timestamp", async () => {
      // Act
      const response = await request(app).get("/health");

      // Assert
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).to.equal(response.body.timestamp);
    });
  });
});
