/**
 * User Service Unit Tests
 *
 * Tests the UserService class with mocked dependencies (repository)
 */

import { expect } from "chai";
import sinon from "sinon";
import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";

describe("UserService", () => {
  let userService: UserService;
  let userRepositoryStub: sinon.SinonStubbedInstance<UserRepository>;

  beforeEach(() => {
    // Create a stubbed instance of UserRepository
    userRepositoryStub = sinon.createStubInstance(UserRepository);

    // Create UserService and inject the stub
    userService = new UserService();
    // Replace the internal repository with our stub
    (userService as any).userRepository = userRepositoryStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getAllUsers", () => {
    it("should return all users from repository", async () => {
      // Arrange
      const mockUsers = [
        { id: "1", email: "user1@test.com", name: "User 1" },
        { id: "2", email: "user2@test.com", name: "User 2" },
      ];
      userRepositoryStub.findAll.resolves(mockUsers as any);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).to.deep.equal(mockUsers);
      expect(userRepositoryStub.findAll.calledOnce).to.be.true;
    });

    it("should return empty array when no users exist", async () => {
      // Arrange
      userRepositoryStub.findAll.resolves([]);

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).to.be.an("array").that.is.empty;
    });
  });

  describe("getUserBySupabaseId", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser = {
        id: "1",
        supabaseId: "supabase-123",
        email: "user@test.com",
        name: "Test User",
      };
      userRepositoryStub.findUnique.resolves(mockUser as any);

      // Act
      const result = await userService.getUserBySupabaseId("supabase-123");

      // Assert
      expect(result).to.deep.equal(mockUser);
      expect(
        userRepositoryStub.findUnique.calledWith({ supabaseId: "supabase-123" })
      ).to.be.true;
    });

    it("should throw AppError when user not found", async () => {
      // Arrange
      userRepositoryStub.findUnique.resolves(null);

      // Act & Assert
      try {
        await userService.getUserBySupabaseId("non-existent");
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).to.equal("User not found");
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe("findByEmail", () => {
    it("should return user when email exists", async () => {
      // Arrange
      const mockUser = { id: "1", email: "user@test.com", name: "Test User" };
      userRepositoryStub.findUnique.resolves(mockUser as any);

      // Act
      const result = await userService.findByEmail("user@test.com");

      // Assert
      expect(result).to.deep.equal(mockUser);
      expect(
        userRepositoryStub.findUnique.calledWith({ email: "user@test.com" })
      ).to.be.true;
    });

    it("should return null when email not found", async () => {
      // Arrange
      userRepositoryStub.findUnique.resolves(null);

      // Act
      const result = await userService.findByEmail("nonexistent@test.com");

      // Assert
      expect(result).to.be.null;
    });
  });

  describe("findOrCreateUser", () => {
    it("should return existing user if already exists", async () => {
      // Arrange
      const existingUser = {
        id: "1",
        supabaseId: "supabase-123",
        email: "user@test.com",
        name: "Existing User",
      };
      userRepositoryStub.findUnique.resolves(existingUser as any);

      // Act
      const result = await userService.findOrCreateUser(
        "supabase-123",
        "user@test.com",
        "New Name"
      );

      // Assert
      expect(result).to.deep.equal(existingUser);
      expect(userRepositoryStub.create.called).to.be.false;
    });

    it("should create new user if not exists", async () => {
      // Arrange
      const newUser = {
        id: "1",
        supabaseId: "supabase-123",
        email: "newuser@test.com",
        name: "New User",
      };
      userRepositoryStub.findUnique.resolves(null);
      userRepositoryStub.create.resolves(newUser as any);

      // Act
      const result = await userService.findOrCreateUser(
        "supabase-123",
        "newuser@test.com",
        "New User"
      );

      // Assert
      expect(result).to.deep.equal(newUser);
      expect(userRepositoryStub.create.calledOnce).to.be.true;
    });
  });
});
