-- First drop the table that depends on the enum
DROP TABLE IF EXISTS "Appointment" CASCADE;
DROP TABLE IF EXISTS "AppointmentStatus" CASCADE;

-- Drop and recreate the enum
DROP TYPE IF EXISTS "AppointmentStatusEnum" CASCADE;
CREATE TYPE "AppointmentStatusEnum" AS ENUM (
  'WAITING',
  'UPCOMING',
  'COMPLETED',
  'CANCELLED',
  'MISSED'
);

-- Recreate the AppointmentStatus table
CREATE TABLE "AppointmentStatus" (
    "id" SERIAL NOT NULL,
    "status" "AppointmentStatusEnum" NOT NULL,
    CONSTRAINT "AppointmentStatus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AppointmentStatus_status_key" UNIQUE ("status")
);

-- Recreate the Appointment table
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "additionalNotes" TEXT,
    "statusId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" 
    FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" 
    FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_statusId_fkey" 
    FOREIGN KEY ("statusId") REFERENCES "AppointmentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_typeId_fkey" 
    FOREIGN KEY ("typeId") REFERENCES "AppointmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update existing data if needed
UPDATE "AppointmentStatus"
SET status = 'WAITING'
WHERE status IN ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN');

UPDATE "AppointmentStatus"
SET status = 'UPCOMING'
WHERE status = 'IN_PROGRESS'; 