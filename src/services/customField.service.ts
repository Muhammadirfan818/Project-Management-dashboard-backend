import { CustomFieldRepository } from "../repositories/customField.repository";

export class CustomFieldService {
  private customFieldRepository: CustomFieldRepository;

  constructor() {
    this.customFieldRepository = new CustomFieldRepository();
  }

  // Create a custom field for a project
  async createField(data: {
    name: string;
    type: string;
    options?: string[];
    projectId: string;
  }) {
    // Validate field type
    const validTypes = ["TEXT", "NUMBER", "DATE", "SELECT"];
    if (!validTypes.includes(data.type)) {
      throw new Error(
        `Invalid field type. Must be one of: ${validTypes.join(", ")}`
      );
    }

    // For SELECT type, options are required
    if (
      data.type === "SELECT" &&
      (!data.options || data.options.length === 0)
    ) {
      throw new Error("SELECT field type requires at least one option");
    }

    return this.customFieldRepository.create(data);
  }

  // Get all custom fields for a project
  async getProjectFields(projectId: string) {
    return this.customFieldRepository.findByProjectId(projectId);
  }

  // Update a custom field
  async updateField(id: string, data: { name?: string; options?: string[] }) {
    return this.customFieldRepository.update(id, data);
  }

  // Delete a custom field
  async deleteField(id: string) {
    return this.customFieldRepository.delete(id);
  }

  // Set a custom field value for a task
  async setFieldValue(customFieldId: string, taskId: string, value: string) {
    return this.customFieldRepository.upsertValue(customFieldId, taskId, value);
  }

  // Get all custom field values for a task
  async getTaskFieldValues(taskId: string) {
    return this.customFieldRepository.findValuesByTaskId(taskId);
  }

  // Clear a custom field value for a task
  async clearFieldValue(customFieldId: string, taskId: string) {
    return this.customFieldRepository.deleteValue(customFieldId, taskId);
  }
}
