-- AlterTable
ALTER TABLE `Category` ADD COLUMN `siteId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Listing` ADD COLUMN `siteId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Professional` ADD COLUMN `siteId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `siteId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Site` (
    `id` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#F97316',
    `secondaryColor` VARCHAR(191) NOT NULL DEFAULT '#12122A',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Site_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Category_siteId_idx` ON `Category`(`siteId`);

-- CreateIndex
CREATE INDEX `Listing_siteId_idx` ON `Listing`(`siteId`);

-- CreateIndex
CREATE INDEX `Professional_siteId_idx` ON `Professional`(`siteId`);

-- CreateIndex
CREATE INDEX `User_siteId_idx` ON `User`(`siteId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Listing` ADD CONSTRAINT `Listing_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Professional` ADD CONSTRAINT `Professional_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
