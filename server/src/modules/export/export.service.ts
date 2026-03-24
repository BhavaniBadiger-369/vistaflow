import { Parser } from "json2csv";
import * as XLSX from "xlsx";

import { tasksService, type TaskListQuery } from "../tasks/tasks.service.js";
import type { RequestUser } from "../../utils/permissions.js";

type ExportQuery = Omit<TaskListQuery, "page" | "pageSize">;

const buildRows = async (currentUser: RequestUser, query: ExportQuery) => {
  const tasks = await tasksService.listForExport(currentUser, query);

  return tasks.map((task) => ({
    Title: task.title,
    Status: task.status,
    Priority: task.priority,
    Project: task.project.name,
    Section: task.section.name,
    Assignee: task.assignedTo?.name ?? "Unassigned",
    DueDate: task.dueDate ?? "",
    UpdatedAt: task.updatedAt,
  }));
};

export const exportService = {
  async toCsv(currentUser: RequestUser, query: ExportQuery) {
    const rows = await buildRows(currentUser, query);
    const parser = new Parser();

    return parser.parse(rows);
  },

  async toXlsx(currentUser: RequestUser, query: ExportQuery) {
    const rows = await buildRows(currentUser, query);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    return XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });
  },
};
