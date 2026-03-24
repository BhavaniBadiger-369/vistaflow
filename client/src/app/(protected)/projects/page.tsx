"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { PaginatedResponse, ProjectDetail, ProjectSummary, UserOption } from "@vistaflow/shared";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectForm } from "@/components/forms/project-form";
import { SectionForm } from "@/components/forms/section-form";
import { TaskForm } from "@/components/forms/task-form";
import { ProjectsTable } from "@/components/tables/projects-table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type ModalState<T> = { open: boolean; value: T | null };

export default function ProjectsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projectModal, setProjectModal] = useState<ModalState<ProjectSummary>>({
    open: false,
    value: null,
  });
  const [sectionModal, setSectionModal] = useState<ModalState<{ id?: string; name?: string; order?: number }>>({
    open: false,
    value: null,
  });
  const [taskModal, setTaskModal] = useState<ModalState<{ sectionId?: string; task?: Partial<ProjectDetail["sections"][number]["tasks"][number]> }>>({
    open: false,
    value: null,
  });
  const debouncedQuery = useDebouncedValue(query, 250);

  const loadUsers = useCallback(async () => {
    if (!canManage) {
      return;
    }

    const { data } = await api.get<PaginatedResponse<UserOption>>("/users", {
      params: { page: 1, pageSize: 50 },
    });
    setUsers(data.data);
  }, [canManage]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<ProjectSummary>>("/projects", {
        params: { page, pageSize: 8, q: debouncedQuery || undefined },
      });

      setProjects(data.data);
      setPageCount(data.meta.pageCount);

      if (!selectedProjectId || !data.data.some((project) => project.id === selectedProjectId)) {
        setSelectedProjectId(data.data[0]?.id ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, selectedProjectId]);

  const loadProjectDetail = useCallback(async (projectId: string) => {
    const { data } = await api.get<{ data: ProjectDetail }>(`/projects/${projectId}`);
    setSelectedProject(data.data);
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedProjectId) {
      void loadProjectDetail(selectedProjectId);
    } else {
      setSelectedProject(null);
    }
  }, [loadProjectDetail, selectedProjectId]);

  const sectionOptions = useMemo(
    () =>
      selectedProject?.sections.map((section) => ({
        id: section.id,
        name: section.name,
      })) ?? [],
    [selectedProject],
  );

  const handleProjectSubmit = async (values: Parameters<typeof ProjectForm>[0]["onSubmit"] extends (arg: infer A) => Promise<void> ? A : never) => {
    setSubmitting(true);
    try {
      if (projectModal.value) {
        await api.patch(`/projects/${projectModal.value.id}`, values);
        toast.success("Project updated");
      } else {
        await api.post("/projects", values);
        toast.success("Project created");
      }
      setProjectModal({ open: false, value: null });
      await loadProjects();
    } catch {
      toast.error("Unable to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSectionSubmit = async (values: { name: string; order: number }) => {
    if (!selectedProject) {
      return;
    }

    setSubmitting(true);
    try {
      if (sectionModal.value?.id) {
        await api.patch(`/sections/${sectionModal.value.id}`, values);
        toast.success("Section updated");
      } else {
        await api.post("/sections", { ...values, projectId: selectedProject.id });
        toast.success("Section created");
      }
      setSectionModal({ open: false, value: null });
      await loadProjectDetail(selectedProject.id);
      await loadProjects();
    } catch {
      toast.error("Unable to save section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskSubmit = async (values: Parameters<typeof TaskForm>[0]["onSubmit"] extends (arg: infer A) => Promise<void> ? A : never) => {
    if (!selectedProject) {
      return;
    }

    setSubmitting(true);
    try {
      const taskId = taskModal.value?.task?.id;
      if (taskId) {
        await api.patch(`/tasks/${taskId}`, values);
        toast.success("Task updated");
      } else {
        await api.post("/tasks", values);
        toast.success("Task created");
      }
      setTaskModal({ open: false, value: null });
      await loadProjectDetail(selectedProject.id);
      await loadProjects();
    } catch {
      toast.error("Unable to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (project: ProjectSummary) => {
    if (!window.confirm(`Delete ${project.name}?`)) {
      return;
    }

    await api.delete(`/projects/${project.id}`);
    toast.success("Project deleted");
    await loadProjects();
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Delete this section?")) {
      return;
    }

    await api.delete(`/sections/${sectionId}`);
    toast.success("Section deleted");
    if (selectedProject) {
      await loadProjectDetail(selectedProject.id);
      await loadProjects();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    await api.delete(`/tasks/${taskId}`);
    toast.success("Task deleted");
    if (selectedProject) {
      await loadProjectDetail(selectedProject.id);
      await loadProjects();
    }
  };

  if (loading && !projects.length) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
            Hierarchical workspace
          </p>
          <h2 className="mt-2 font-mono text-3xl font-semibold">
            Projects, sections, and tasks
          </h2>
        </div>
        {canManage ? (
          <Button onClick={() => setProjectModal({ open: true, value: null })}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="surface-card flex items-center gap-3 rounded-[30px] p-4">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search projects"
            />
            <Button
              variant="secondary"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>

          {projects.length ? (
            <ProjectsTable
              projects={projects}
              selectedId={selectedProjectId}
              onSelect={setSelectedProjectId}
              onEdit={
                canManage
                  ? (project) => setProjectModal({ open: true, value: project })
                  : undefined
              }
              onDelete={canManage ? handleDeleteProject : undefined}
            />
          ) : (
            <EmptyState
              title="No projects found"
              description="Create a project or widen the current search."
            />
          )}
        </div>

        {selectedProject ? (
          <div className="space-y-4">
            <Card className="space-y-4 rounded-[32px]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-mono text-2xl font-semibold">
                      {selectedProject.name}
                    </h3>
                    <Badge tone="primary">{selectedProject.status}</Badge>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--muted))]">
                    {selectedProject.description || "No description provided."}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSectionModal({ open: true, value: null })}
                    >
                      New section
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setTaskModal({
                          open: true,
                          value: { sectionId: selectedProject.sections[0]?.id },
                        })
                      }
                    >
                      New task
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Owner", selectedProject.owner.name],
                  ["Updated", formatDate(selectedProject.updatedAt)],
                  ["Completion", `${selectedProject.completion}%`],
                ].map(([label, value]) => (
                  <div key={label} className="surface-muted rounded-3xl px-4 py-4">
                    <p className="text-sm text-[rgb(var(--muted))]">{label}</p>
                    <p className="mt-2 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              {selectedProject.sections.map((section) => (
                <Card key={section.id} className="space-y-4 rounded-[30px]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{section.name}</h4>
                        <Badge>{section.taskCount} tasks</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                        Order {section.order}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setSectionModal({
                              open: true,
                              value: {
                                id: section.id,
                                name: section.name,
                                order: section.order,
                              },
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {section.tasks.length ? (
                    <div className="space-y-3">
                      {section.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="surface-muted rounded-3xl px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{task.title}</p>
                              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                                {task.assignedTo?.name ?? "Unassigned"} ·{" "}
                                {formatDate(task.dueDate)}
                              </p>
                            </div>
                            <Badge
                              tone={
                                task.status === "DONE"
                                  ? "success"
                                  : task.priority === "HIGH"
                                    ? "danger"
                                    : "primary"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                          {canManage ? (
                            <div className="mt-4 flex gap-2">
                              <Button
                                variant="ghost"
                                onClick={() =>
                                  setTaskModal({
                                    open: true,
                                    value: { task },
                                  })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No tasks in this section"
                      description="Add tasks to start tracking progress."
                    />
                  )}
                </Card>
              ))}
            </div>

            {!selectedProject.sections.length ? (
              <Card className="rounded-[30px]">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[rgba(var(--primary),0.14)] p-3 text-[rgb(var(--primary))]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">No sections yet</p>
                    <p className="text-sm text-[rgb(var(--muted))]">
                      Add a section to start structuring work inside this project.
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="Select a project"
            description="Choose a project from the list to inspect sections and tasks."
          />
        )}
      </div>

      <Modal
        open={projectModal.open}
        onClose={() => setProjectModal({ open: false, value: null })}
        title={projectModal.value ? "Edit project" : "Create project"}
      >
        <ProjectForm
          initialValues={projectModal.value}
          owners={users.filter((candidate) => candidate.role !== "MEMBER")}
          isManager={user?.role === "MANAGER"}
          onSubmit={handleProjectSubmit}
          submitting={submitting}
        />
      </Modal>

      <Modal
        open={sectionModal.open}
        onClose={() => setSectionModal({ open: false, value: null })}
        title={sectionModal.value?.id ? "Edit section" : "Create section"}
      >
        <SectionForm
          initialValues={sectionModal.value}
          onSubmit={handleSectionSubmit}
          submitting={submitting}
        />
      </Modal>

      <Modal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, value: null })}
        title={taskModal.value?.task?.id ? "Edit task" : "Create task"}
      >
        <TaskForm
          initialValues={
            taskModal.value?.task
              ? taskModal.value.task
              : { sectionId: taskModal.value?.sectionId }
          }
          sections={sectionOptions}
          users={users}
          onSubmit={handleTaskSubmit}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
