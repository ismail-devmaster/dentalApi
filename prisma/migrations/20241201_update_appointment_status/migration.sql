-- First drop existing enum constraints
ALTER TABLE "AppointmentStatus" DROP CONSTRAINT IF EXISTS "AppointmentStatus_status_fkey";
ALTER TABLE "AppointmentStatus" ALTER COLUMN status DROP DEFAULT;

-- Drop and recreate the enum
DROP TYPE IF EXISTS "AppointmentStatusEnum";
CREATE TYPE "AppointmentStatusEnum" AS ENUM (
  'WAITING',
  'UPCOMING',
  'COMPLETED',
  'CANCELLED',
  'MISSED'
);

-- Update existing data if needed
UPDATE "AppointmentStatus"
SET status = 'WAITING'
WHERE status IN ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN');

UPDATE "AppointmentStatus"
SET status = 'UPCOMING'
WHERE status = 'IN_PROGRESS'; 