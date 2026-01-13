import { CustomFieldRepository } from "../repositories/customField.repository";

export class CustomFieldService {
  private customFieldRepository: CustomFieldRepository;

  constructor() {
    this.customFieldRepository = new CustomFieldRepository();
  }

  async createField(data: {
    name: string;
    type: string;
    options?: string[];
    projectId: string;
  }) {
    const validTypes = ["TEXT", "NUMBER", "DATE", "SELECT"];
    if (!validTypes.includes(data.type)) {
      throw new Error(
        `Invalid field type. Must be one of: ${validTypes.join(", ")}`,
      );
    }

    if (
      data.type === "SELECT" &&
      (!data.options || data.options.length === 0)
    ) {
      throw new Error("SELECT field type requires at least one option");
    }

    return this.customFieldRepository.create(data);
  }

  async getProjectFields(projectId: string) {
    return this.customFieldRepository.findByProjectId(projectId);
  }
  async updateField(id: string, data: { name?: string; options?: string[] }) {
    return this.customFieldRepository.update(id, data);
  }

  async deleteField(id: string) {
    return this.customFieldRepository.delete(id);
  }
  async setFieldValue(customFieldId: string, taskId: string, value: string) {
    return this.customFieldRepository.upsertValue(customFieldId, taskId, value);
  }

  async getTaskFieldValues(taskId: string) {
    return this.customFieldRepository.findValuesByTaskId(taskId);
  }
  async clearFieldValue(customFieldId: string, taskId: string) {
    return this.customFieldRepository.deleteValue(customFieldId, taskId);
  }
}
