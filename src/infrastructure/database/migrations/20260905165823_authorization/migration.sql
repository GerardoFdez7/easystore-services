-- CreateEnum
CREATE TYPE "tenant"."PermissionAction" AS ENUM ('VIEW', 'CREATE', 'EDIT', 'DELETE');

-- AlterTable
ALTER TABLE "tenant"."EmployeeRole" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tenant"."RoleFeatures" ADD COLUMN     "action" "tenant"."PermissionAction" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRole_tenantId_role_key" ON "tenant"."EmployeeRole"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "RoleFeatures_roleId_featureId_action_key" ON "tenant"."RoleFeatures"("roleId", "featureId", "action");
