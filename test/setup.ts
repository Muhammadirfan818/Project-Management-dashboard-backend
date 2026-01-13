import sinon from "sinon";

process.env.NODE_ENV = "test";
beforeEach(() => {});

afterEach(() => {
  sinon.restore();
});
