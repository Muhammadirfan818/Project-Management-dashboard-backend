import { expect } from "chai";
import sinon from "sinon";
import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";

describe("UserService", () => {
  let userService: UserService;
  let userRepositoryStub: sinon.SinonStubbedInstance<UserRepository>;

  beforeEach(() => {
    userRepositoryStub = sinon.createStubInstance(UserRepository);
    userService = new UserService();
    (userService as any).userRepository = userRepositoryStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getAllUsers", () => {
    it("should return all users from repository", async () => {
      const mockUsers = [
        { id: "1", email: "user1@test.com", name: "User 1" },
        { id: "2", email: "user2@test.com", name: "User 2" },
      ];
      userRepositoryStub.findAll.resolves(mockUsers as any);

      const result = await userService.getAllUsers();

      expect(result).to.deep.equal(mockUsers);
      expect(userRepositoryStub.findAll.calledOnce).to.be.true;
    });

    it("should return empty array when no users exist", async () => {
      userRepositoryStub.findAll.resolves([]);

      const result = await userService.getAllUsers();

      expect(result).to.be.an("array").that.is.empty;
    });
  });

  describe("getUserBySupabaseId", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "1",
        supabaseId: "supabase-123",
        email: "user@test.com",
        name: "Test User",
      };
      userRepositoryStub.findUnique.resolves(mockUser as any);

      const result = await userService.getUserBySupabaseId("supabase-123");

      expect(result).to.deep.equal(mockUser);
      expect(
        userRepositoryStub.findUnique.calledWith({ supabaseId: "supabase-123" })
      ).to.be.true;
    });

    it("should throw AppError when user not found", async () => {
      userRepositoryStub.findUnique.resolves(null);

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
      const mockUser = { id: "1", email: "user@test.com", name: "Test User" };
      userRepositoryStub.findUnique.resolves(mockUser as any);

      const result = await userService.findByEmail("user@test.com");
      expect(result).to.deep.equal(mockUser);
      expect(
        userRepositoryStub.findUnique.calledWith({ email: "user@test.com" })
      ).to.be.true;
    });

    it("should return null when email not found", async () => {
      userRepositoryStub.findUnique.resolves(null);

      const result = await userService.findByEmail("nonexistent@test.com");

      expect(result).to.be.null;
    });
  });

  describe("findOrCreateUser", () => {
    it("should return existing user if already exists", async () => {
      const existingUser = {
        id: "1",
        supabaseId: "supabase-123",
        email: "user@test.com",
        name: "Existing User",
      };
      userRepositoryStub.findUnique.resolves(existingUser as any);

      const result = await userService.findOrCreateUser(
        "supabase-123",
        "user@test.com",
        "New Name"
      );

      expect(result).to.deep.equal(existingUser);
      expect(userRepositoryStub.create.called).to.be.false;
    });

    it("should create new user if not exists", async () => {
      const newUser = {
        id: "1",
        supabaseId: "supabase-123",
        email: "newuser@test.com",
        name: "New User",
      };
      userRepositoryStub.findUnique.resolves(null);
      userRepositoryStub.create.resolves(newUser as any);

      const result = await userService.findOrCreateUser(
        "supabase-123",
        "newuser@test.com",
        "New User"
      );

      expect(result).to.deep.equal(newUser);
      expect(userRepositoryStub.create.calledOnce).to.be.true;
    });
  });
});
