/*
  Warnings:

  - A unique constraint covering the columns `[siteId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[siteId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `siteId` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `siteId` on table `Listing` required. This step will fail if there are existing NULL values in that column.
  - Made the column `siteId` on table `Professional` required. This step will fail if there are existing NULL values in that column.
  - Made the column `siteId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Category` DROP FOREIGN KEY `Category_siteId_fkey`;

-- DropForeignKey
ALTER TABLE `Listing` DROP FOREIGN KEY `Listing_siteId_fkey`;

-- DropForeignKey
ALTER TABLE `Professional` DROP FOREIGN KEY `Professional_siteId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_siteId_fkey`;

-- DropIndex
DROP INDEX `Category_siteId_idx` ON `Category`;

-- DropIndex
DROP INDEX `Category_slug_key` ON `Category`;

-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- DropIndex
DROP INDEX `User_siteId_idx` ON `User`;

-- AlterTable
ALTER TABLE `Category` MODIFY `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Listing` MODIFY `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Professional` MODIFY `siteId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `siteId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Category_siteId_slug_key` ON `Category`(`siteId`, `slug`);

-- CreateIndex
CREATE UNIQUE INDEX `User_siteId_email_key` ON `User`(`siteId`, `email`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Professional` ADD CONSTRAINT `Professional_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
