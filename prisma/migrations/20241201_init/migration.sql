-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AppointmentStatusEnum" AS ENUM ('WAITING', 'UPCOMING', 'COMPLETED', 'CANCELLED', 'MISSED');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QueueStatusEnum" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE IF NOT EXISTS "Sex" (
    "id" SERIAL NOT NULL,
    "gender" "Gender" NOT NULL UNIQUE,
    CONSTRAINT "Sex_pkey" PRIMARY KEY ("id")
);

-- Rest of your tables... 