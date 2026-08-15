-- CreateTable
CREATE TABLE `RentalApplication` (
    `id` VARCHAR(191) NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('LOCATION', 'ACHAT') NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `situation` TEXT NULL,
    `income` TEXT NULL,
    `hasGuarantor` BOOLEAN NOT NULL DEFAULT false,
    `guarantorInfo` TEXT NULL,
    `hasPets` BOOLEAN NOT NULL DEFAULT false,
    `petsDetails` TEXT NULL,
    `desiredDuration` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RentalApplication_listingId_idx`(`listingId`),
    INDEX `RentalApplication_userId_idx`(`userId`),
    INDEX `RentalApplication_siteId_idx`(`siteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalApplicationDocument` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,

    INDEX `RentalApplicationDocument_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RentalApplication` ADD CONSTRAINT `RentalApplication_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalApplication` ADD CONSTRAINT `RentalApplication_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalApplication` ADD CONSTRAINT `RentalApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalApplicationDocument` ADD CONSTRAINT `RentalApplicationDocument_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `RentalApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
