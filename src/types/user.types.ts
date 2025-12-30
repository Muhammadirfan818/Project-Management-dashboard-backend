import { SpecificRole } from "@prisma/client";

export interface CreateUserInput {
  supabaseId: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  jobTitle?: string;
  profileBio?: string;
  specificRole?: SpecificRole;
  department?: string;
  supabaseId?: string;
  hasCompletedOnboarding?: boolean;
}
