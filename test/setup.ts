/**
 * Test Setup - Runs before all tests
 * This file configures the test environment
 */

import sinon from "sinon";

// Set test environment
process.env.NODE_ENV = "test";

// Global hooks
beforeEach(() => {
  // Reset all stubs before each test
});

afterEach(() => {
  // Restore all sinon stubs after each test
  sinon.restore();
});
