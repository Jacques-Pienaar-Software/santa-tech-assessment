-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organisation` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganisationMember` (
    `userId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `role` ENUM('SONGWRITER', 'MANAGER') NOT NULL,

    PRIMARY KEY (`userId`, `orgId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAuthor` (
    `mediaId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`mediaId`, `userId`, `orgId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `orgId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pitch` (
    `id` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `authorUserId` VARCHAR(191) NOT NULL,
    `authorOrgId` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PitchTags` (
    `id` VARCHAR(191) NOT NULL,
    `pitchId` VARCHAR(191) NOT NULL,
    `tagValue` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PitchTargetAuthor` (
    `pitchId` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `targetUserId` VARCHAR(191) NOT NULL,
    `targetOrgId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`pitchId`, `mediaId`, `targetUserId`, `targetOrgId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrganisationMember` ADD CONSTRAINT `OrganisationMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganisationMember` ADD CONSTRAINT `OrganisationMember_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAuthor` ADD CONSTRAINT `MediaAuthor_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAuthor` ADD CONSTRAINT `MediaAuthor_userId_orgId_fkey` FOREIGN KEY (`userId`, `orgId`) REFERENCES `OrganisationMember`(`userId`, `orgId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pitch` ADD CONSTRAINT `Pitch_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pitch` ADD CONSTRAINT `Pitch_authorUserId_authorOrgId_fkey` FOREIGN KEY (`authorUserId`, `authorOrgId`) REFERENCES `OrganisationMember`(`userId`, `orgId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PitchTags` ADD CONSTRAINT `PitchTags_pitchId_fkey` FOREIGN KEY (`pitchId`) REFERENCES `Pitch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PitchTargetAuthor` ADD CONSTRAINT `PitchTargetAuthor_pitchId_fkey` FOREIGN KEY (`pitchId`) REFERENCES `Pitch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PitchTargetAuthor` ADD CONSTRAINT `PitchTargetAuthor_mediaId_targetUserId_targetOrgId_fkey` FOREIGN KEY (`mediaId`, `targetUserId`, `targetOrgId`) REFERENCES `MediaAuthor`(`mediaId`, `userId`, `orgId`) ON DELETE RESTRICT ON UPDATE CASCADE;
