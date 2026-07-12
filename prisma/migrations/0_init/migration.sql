-- Enable gist extensions for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE');
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED', 'LOST');
CREATE TYPE "AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- Create Sequence for Asset Tag Auto Generation
CREATE SEQUENCE asset_tag_seq START WITH 1;

-- Create Table: Department
CREATE TABLE "Department" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentDepartmentId" UUID,
    "headId" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- Create Table: User
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "departmentId" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Table: Category
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultWarrantyMonths" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Create Table: Asset
CREATE TABLE "Asset" (
    "id" UUID NOT NULL,
    "assetTag" TEXT NOT NULL DEFAULT ('AF-' || lpad(nextval('asset_tag_seq'::regclass)::text, 5, '0')),
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" UUID NOT NULL,
    "departmentId" UUID,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchaseCost" DECIMAL(10,2) NOT NULL,
    "vendor" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "warrantyExpiry" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "condition" "AssetCondition" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "imageUrl" TEXT,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- Create Table: Allocation
CREATE TABLE "Allocation" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "allocatedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturnDate" TIMESTAMP(3),
    "returnedDate" TIMESTAMP(3),
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- Create Table: TransferRequest
CREATE TABLE "TransferRequest" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "fromEmployeeId" UUID NOT NULL,
    "toEmployeeId" UUID NOT NULL,
    "requestedById" UUID NOT NULL,
    "approvedById" UUID,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- Create Table: Resource
CREATE TABLE "Resource" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- Create Table: Booking
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- Create Table: MaintenanceRequest
CREATE TABLE "MaintenanceRequest" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "raisedById" UUID NOT NULL,
    "assignedToId" UUID,
    "priority" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- Create Table: AuditCycle
CREATE TABLE "AuditCycle" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditCycle_pkey" PRIMARY KEY ("id")
);

-- Create Table: AuditItem
CREATE TABLE "AuditItem" (
    "id" UUID NOT NULL,
    "auditCycleId" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "expectedLocation" TEXT NOT NULL,
    "actualLocation" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "verifiedById" UUID,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "AuditItem_pkey" PRIMARY KEY ("id")
);

-- Create Table: Notification
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create Table: ActivityLog
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "entity" TEXT NOT NULL,
    "entityId" UUID,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Create Unique Constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- Create Indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

CREATE INDEX "Department_parentDepartmentId_idx" ON "Department"("parentDepartmentId");
CREATE INDEX "Department_headId_idx" ON "Department"("headId");

CREATE INDEX "Asset_assetTag_idx" ON "Asset"("assetTag");
CREATE INDEX "Asset_serialNumber_idx" ON "Asset"("serialNumber");
CREATE INDEX "Asset_categoryId_idx" ON "Asset"("categoryId");
CREATE INDEX "Asset_departmentId_idx" ON "Asset"("departmentId");
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

CREATE INDEX "Allocation_assetId_idx" ON "Allocation"("assetId");
CREATE INDEX "Allocation_employeeId_idx" ON "Allocation"("employeeId");
CREATE INDEX "Allocation_allocatedDate_idx" ON "Allocation"("allocatedDate");

CREATE INDEX "TransferRequest_assetId_idx" ON "TransferRequest"("assetId");
CREATE INDEX "TransferRequest_fromEmployeeId_idx" ON "TransferRequest"("fromEmployeeId");
CREATE INDEX "TransferRequest_toEmployeeId_idx" ON "TransferRequest"("toEmployeeId");
CREATE INDEX "TransferRequest_requestedById_idx" ON "TransferRequest"("requestedById");
CREATE INDEX "TransferRequest_status_idx" ON "TransferRequest"("status");

CREATE INDEX "Booking_resourceId_startTime_endTime_idx" ON "Booking"("resourceId", "startTime", "endTime");
CREATE INDEX "Booking_employeeId_idx" ON "Booking"("employeeId");
CREATE INDEX "Booking_startTime_idx" ON "Booking"("startTime");

CREATE INDEX "MaintenanceRequest_assetId_idx" ON "MaintenanceRequest"("assetId");
CREATE INDEX "MaintenanceRequest_raisedById_idx" ON "MaintenanceRequest"("raisedById");
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

CREATE INDEX "AuditCycle_departmentId_idx" ON "AuditCycle"("departmentId");
CREATE INDEX "AuditCycle_status_idx" ON "AuditCycle"("status");

CREATE INDEX "AuditItem_auditCycleId_idx" ON "AuditItem"("auditCycleId");
CREATE INDEX "AuditItem_assetId_idx" ON "AuditItem"("assetId");
CREATE INDEX "AuditItem_verificationStatus_idx" ON "AuditItem"("verificationStatus");

CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_entity_idx" ON "ActivityLog"("entity");
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- Foreign Key Constraints
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Department" ADD CONSTRAINT "Department_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_fromEmployeeId_fkey" FOREIGN KEY ("fromEmployeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_toEmployeeId_fkey" FOREIGN KEY ("toEmployeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditCycle" ADD CONSTRAINT "AuditCycle_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditCycle" ADD CONSTRAINT "AuditCycle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_auditCycleId_fkey" FOREIGN KEY ("auditCycleId") REFERENCES "AuditCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Business Rule Constraints
-- 1. Only one active allocation per asset.
CREATE UNIQUE INDEX asset_active_allocation_idx ON "Allocation"("assetId") WHERE "status" = 'ACTIVE' AND "returnedDate" IS NULL;

-- 2. No overlapping bookings for the same resource.
ALTER TABLE "Booking" ADD CONSTRAINT booking_no_overlap
EXCLUDE USING gist (
  "resourceId" WITH =,
  tsrange("startTime", "endTime") WITH &&
) WHERE ("status" = 'BOOKED');

-- Automations (Triggers)
-- 1. Trigger to automatically assign Asset Tag if not provided
CREATE OR REPLACE FUNCTION set_asset_tag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."assetTag" IS NULL OR NEW."assetTag" = '' THEN
    NEW."assetTag" := 'AF-' || lpad(nextval('asset_tag_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_asset_tag
BEFORE INSERT ON "Asset"
FOR EACH ROW EXECUTE FUNCTION set_asset_tag();

-- 2. Trigger to update Asset status on Allocation status change
CREATE OR REPLACE FUNCTION update_asset_status_on_allocation()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.status = 'ACTIVE' AND NEW."returnedDate" IS NULL THEN
      UPDATE "Asset" SET status = 'ALLOCATED' WHERE id = NEW."assetId";
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF NEW."returnedDate" IS NOT NULL AND OLD."returnedDate" IS NULL THEN
      UPDATE "Asset" SET status = 'AVAILABLE' WHERE id = NEW."assetId";
    ELSIF NEW.status = 'RETURNED' AND OLD.status != 'RETURNED' THEN
      UPDATE "Asset" SET status = 'AVAILABLE' WHERE id = NEW."assetId";
    ELSIF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' AND NEW."returnedDate" IS NULL THEN
      UPDATE "Asset" SET status = 'ALLOCATED' WHERE id = NEW."assetId";
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_allocation_status_change
AFTER INSERT OR UPDATE ON "Allocation"
FOR EACH ROW EXECUTE FUNCTION update_asset_status_on_allocation();

-- 3. Trigger to update Asset status on Maintenance Request status change
CREATE OR REPLACE FUNCTION update_asset_status_on_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'IN_PROGRESS' AND (TG_OP = 'INSERT' OR OLD.status != 'IN_PROGRESS') THEN
    UPDATE "Asset" SET status = 'UNDER_MAINTENANCE' WHERE id = NEW."assetId";
  ELSIF NEW.status = 'COMPLETED' AND (TG_OP = 'INSERT' OR OLD.status != 'COMPLETED') THEN
    UPDATE "Asset" SET status = 'AVAILABLE' WHERE id = NEW."assetId";
  ELSIF NEW.status = 'REJECTED' AND (TG_OP = 'UPDATE' AND OLD.status = 'IN_PROGRESS') THEN
    UPDATE "Asset" SET status = 'AVAILABLE' WHERE id = NEW."assetId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maintenance_status_change
AFTER INSERT OR UPDATE ON "MaintenanceRequest"
FOR EACH ROW EXECUTE FUNCTION update_asset_status_on_maintenance();
