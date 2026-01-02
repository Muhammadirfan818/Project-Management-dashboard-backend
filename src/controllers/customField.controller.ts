import { Request, Response, NextFunction } from "express";
import { CustomFieldService } from "../services/customField.service";
import { sendSuccess } from "../utils/response";

const customFieldService = new CustomFieldService();

export class CustomFieldController {
  // Create a custom field for a project
  async createField(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type, options, projectId } = req.body;
      const field = await customFieldService.createField({
        name,
        type,
        options,
        projectId,
      });
      sendSuccess(res, field, "Custom field created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  // Get all custom fields for a project
  async getProjectFields(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const fields = await customFieldService.getProjectFields(projectId);
      sendSuccess(res, fields);
    } catch (error) {
      next(error);
    }
  }

  // Update a custom field
  async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, options } = req.body;
      const field = await customFieldService.updateField(id, { name, options });
      sendSuccess(res, field, "Custom field updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Delete a custom field
  async deleteField(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await customFieldService.deleteField(id);
      sendSuccess(res, null, "Custom field deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // Set a custom field value for a task
  async setFieldValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { fieldId, taskId } = req.params;
      const { value } = req.body;
      const fieldValue = await customFieldService.setFieldValue(
        fieldId,
        taskId,
        value,
      );
      sendSuccess(res, fieldValue, "Field value saved successfully");
    } catch (error) {
      next(error);
    }
  }

  // Get all custom field values for a task
  async getTaskFieldValues(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const values = await customFieldService.getTaskFieldValues(taskId);
      sendSuccess(res, values);
    } catch (error) {
      next(error);
    }
  }

  // Clear a custom field value for a task
  async clearFieldValue(req: Request, res: Response, next: NextFunction) {
    try {
      const { fieldId, taskId } = req.params;
      await customFieldService.clearFieldValue(fieldId, taskId);
      sendSuccess(res, null, "Field value cleared successfully");
    } catch (error) {
      next(error);
    }
  }
}
