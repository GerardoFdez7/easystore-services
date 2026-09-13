-- CreateEnum
CREATE TYPE "tenant"."PermissionAction" AS ENUM ('VIEW', 'CREATE', 'EDIT', 'DELETE');

-- AlterTable
ALTER TABLE "tenant"."EmployeeRole" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tenant"."RoleFeatures" ADD COLUMN     "action" "tenant"."PermissionAction" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRole_tenantId_role_key" ON "tenant"."EmployeeRole"("tenantId", "role");

-- Required by the tenant-scoped composite foreign keys below.
CREATE UNIQUE INDEX "EmployeeRole_id_tenantId_key" ON "tenant"."EmployeeRole"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RoleFeatures_roleId_featureId_action_key" ON "tenant"."RoleFeatures"("roleId", "featureId", "action");

-- Reject existing rows whose role and tenant scopes do not agree before adding
-- composite foreign keys that enforce the boundary for future writes.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "tenant"."Employee" e
    LEFT JOIN "tenant"."EmployeeRole" r ON r."id" = e."roleId"
    WHERE r."id" IS NULL OR r."tenantId" <> e."tenantId"
  ) OR EXISTS (
    SELECT 1
    FROM "tenant"."RoleFeatures" rf
    LEFT JOIN "tenant"."EmployeeRole" r ON r."id" = rf."roleId"
    WHERE r."id" IS NULL OR r."tenantId" <> rf."tenantId"
  ) THEN
    RAISE EXCEPTION 'Cannot add tenant-scoped role foreign keys: mismatched role links exist';
  END IF;
END $$;

ALTER TABLE "tenant"."Employee" DROP CONSTRAINT "Employee_roleId_fkey";
ALTER TABLE "tenant"."RoleFeatures" DROP CONSTRAINT "RoleFeatures_roleId_fkey";
ALTER TABLE "tenant"."Employee" ADD CONSTRAINT "Employee_roleId_tenantId_fkey"
  FOREIGN KEY ("roleId", "tenantId") REFERENCES "tenant"."EmployeeRole"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant"."RoleFeatures" ADD CONSTRAINT "RoleFeatures_roleId_tenantId_fkey"
  FOREIGN KEY ("roleId", "tenantId") REFERENCES "tenant"."EmployeeRole"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
