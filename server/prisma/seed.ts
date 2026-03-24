import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hash = (value: string) => bcrypt.hash(value, 12);

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.section.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, managerPassword, memberPassword, analystPassword] =
    await Promise.all([
      hash("Admin@123"),
      hash("Manager@123"),
      hash("Member@123"),
      hash("Analyst@123"),
    ]);

  const admin = await prisma.user.create({
    data: {
      name: "Avery Carter",
      email: "admin@vistaflow.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Maya Reynolds",
      email: "manager@vistaflow.com",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "member@vistaflow.com",
      password: memberPassword,
      role: "MEMBER",
      managerId: manager.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Nina Patel",
      email: "analyst@vistaflow.com",
      password: analystPassword,
      role: "MEMBER",
      managerId: manager.id,
    },
  });

  const projectA = await prisma.project.create({
    data: {
      name: "Customer Success Hub",
      description:
        "Internal tooling upgrade for support workflows, triage ownership, and SLA reporting.",
      status: "ACTIVE",
      ownerId: manager.id,
      createdById: admin.id,
    },
  });

  const projectB = await prisma.project.create({
    data: {
      name: "People Ops Workspace",
      description:
        "Cross-team rollout for onboarding templates, approvals, and HR document automation.",
      status: "PLANNING",
      ownerId: manager.id,
      createdById: manager.id,
    },
  });

  const projectC = await prisma.project.create({
    data: {
      name: "Executive Reporting Refresh",
      description:
        "Admin-owned analytics initiative focused on board reporting and KPI standardization.",
      status: "ON_HOLD",
      ownerId: admin.id,
      createdById: admin.id,
    },
  });

  const backlogA = await prisma.section.create({
    data: {
      name: "Backlog",
      order: 0,
      projectId: projectA.id,
    },
  });

  const buildA = await prisma.section.create({
    data: {
      name: "Build Sprint",
      order: 1,
      projectId: projectA.id,
    },
  });

  const qaA = await prisma.section.create({
    data: {
      name: "QA",
      order: 2,
      projectId: projectA.id,
    },
  });

  const planningB = await prisma.section.create({
    data: {
      name: "Planning",
      order: 0,
      projectId: projectB.id,
    },
  });

  const rolloutB = await prisma.section.create({
    data: {
      name: "Rollout",
      order: 1,
      projectId: projectB.id,
    },
  });

  const analysisC = await prisma.section.create({
    data: {
      name: "Analysis",
      order: 0,
      projectId: projectC.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Map current support escalation flow",
        description: "Document handoffs and blockers across the current support process.",
        status: "DONE",
        priority: "HIGH",
        dueDate: new Date("2026-03-18T00:00:00.000Z"),
        sectionId: backlogA.id,
        projectId: projectA.id,
        assignedToId: member.id,
        createdById: manager.id,
      },
      {
        title: "Implement SLA breach dashboard cards",
        description: "Create dashboard components and API calculations for SLA exposure.",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: new Date("2026-03-27T00:00:00.000Z"),
        sectionId: buildA.id,
        projectId: projectA.id,
        assignedToId: analyst.id,
        createdById: manager.id,
      },
      {
        title: "Regression test support routing rules",
        description: "Verify inbox ownership logic after the workflow rewrite.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date("2026-03-29T00:00:00.000Z"),
        sectionId: qaA.id,
        projectId: projectA.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
      {
        title: "Draft onboarding checklist templates",
        description: "Prepare draft checklists for engineering, product, and support hires.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date("2026-03-30T00:00:00.000Z"),
        sectionId: planningB.id,
        projectId: projectB.id,
        assignedToId: member.id,
        createdById: manager.id,
      },
      {
        title: "Coordinate pilot rollout with HR ops",
        description: "Set up the first pilot cohort and track open operational issues.",
        status: "BLOCKED",
        priority: "HIGH",
        dueDate: new Date("2026-03-24T00:00:00.000Z"),
        sectionId: rolloutB.id,
        projectId: projectB.id,
        assignedToId: analyst.id,
        createdById: manager.id,
      },
      {
        title: "Normalize KPI definitions",
        description: "Align finance and operations terminology before rebuilding reports.",
        status: "TODO",
        priority: "LOW",
        dueDate: new Date("2026-04-05T00:00:00.000Z"),
        sectionId: analysisC.id,
        projectId: projectC.id,
        assignedToId: null,
        createdById: admin.id,
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "LOGIN",
        entityType: "AUTH",
        entityId: admin.id,
      },
      {
        userId: admin.id,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: projectA.id,
      },
      {
        userId: manager.id,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: projectB.id,
      },
      {
        userId: manager.id,
        action: "SECTION_CREATED",
        entityType: "SECTION",
        entityId: backlogA.id,
      },
      {
        userId: manager.id,
        action: "TASK_ASSIGNED",
        entityType: "TASK",
        metadata: {
          assignedToId: member.id,
          projectId: projectA.id,
        },
      },
      {
        userId: member.id,
        action: "TASK_STATUS_CHANGED",
        entityType: "TASK",
        metadata: {
          status: "DONE",
        },
      },
    ],
  });

  console.log("Seed completed");
  console.log("Admin: admin@vistaflow.com / Admin@123");
  console.log("Manager: manager@vistaflow.com / Manager@123");
  console.log("Member: member@vistaflow.com / Member@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
