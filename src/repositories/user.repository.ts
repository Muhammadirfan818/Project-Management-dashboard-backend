import { prisma } from "../config/prisma";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";

export class UserRepository {
  async findUnique(
    where: { id: string } | { email: string } | { supabaseId: string },
  ) {
    return prisma.user.findUnique({
      where,
      include: { settings: true },
    });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        department: true,
        avatar: true,
      },
    });
  }

  async findBySupabaseIdWithProjects(supabaseId: string) {
    return prisma.user.findUnique({
      where: { supabaseId },
      include: {
        settings: true,
        ownedProjects: {
          select: {
            id: true,
            name: true,
            key: true,
            status: true,
          },
        },
      },
    });
  }

  async create(data: CreateUserInput) {
    return prisma.user.create({
      data,
      include: { settings: true },
    });
  }

  async update(supabaseId: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { supabaseId },
      data,
    });
  }

  async updateById(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { settings: true },
    });
  }

  async delete(supabaseId: string) {
    return prisma.user.delete({
      where: { supabaseId },
    });
  }
}
