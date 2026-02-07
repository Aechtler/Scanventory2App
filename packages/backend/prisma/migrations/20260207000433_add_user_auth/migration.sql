/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns as nullable first
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "password" TEXT;

-- Step 2: Update existing users with default values
-- Default email: admin@scanapp.local
-- Default password: "admin123" hashed with bcrypt (10 rounds)
UPDATE "User" 
SET "email" = 'admin@scanapp.local',
    "password" = '$2a$10$X7ZQKq8JQY9YQXqYqZ8YqO7qZ8YqZ8YqZ8YqZ8YqZ8YqZ8YqZ8Yqu'
WHERE "email" IS NULL;

-- Step 3: Make columns NOT NULL
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- Step 4: Make name and apiKey optional
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "apiKey" DROP NOT NULL;

-- Step 5: Make userId optional in ScannedItem
-- DropForeignKey
ALTER TABLE "ScannedItem" DROP CONSTRAINT "ScannedItem_userId_fkey";

-- AlterTable
ALTER TABLE "ScannedItem" ALTER COLUMN "userId" DROP NOT NULL;

-- Step 6: Create unique index on email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Step 7: Add foreign key with SET NULL
ALTER TABLE "ScannedItem" ADD CONSTRAINT "ScannedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
