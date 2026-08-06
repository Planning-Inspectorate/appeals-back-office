/*
  Warnings:

  - You are about to drop the column `advertInPosition` on the `AppellantCase` table. All the data in the column will be lost.
  - You are about to drop the column `highwayLand` on the `AppellantCase` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] DROP COLUMN [advertInPosition],
[highwayLand];

-- CreateTable
CREATE TABLE [dbo].[AppellantCaseAdvertDetails] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appellantCaseId] INT NOT NULL,
    [advertTypeId] INT,
    [advertInPosition] BIT NOT NULL,
    [highwayLand] BIT NOT NULL,
    CONSTRAINT [AppellantCaseAdvertDetails_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[AdvertType] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [AdvertType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [AdvertType_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseAdvertDetails_advertTypeId_idx] ON [dbo].[AppellantCaseAdvertDetails]([advertTypeId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AppellantCaseAdvertDetails_appellantCaseId_idx] ON [dbo].[AppellantCaseAdvertDetails]([appellantCaseId]);

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseAdvertDetails] ADD CONSTRAINT [AppellantCaseAdvertDetails_appellantCaseId_fkey] FOREIGN KEY ([appellantCaseId]) REFERENCES [dbo].[AppellantCase]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AppellantCaseAdvertDetails] ADD CONSTRAINT [AppellantCaseAdvertDetails_advertTypeId_fkey] FOREIGN KEY ([advertTypeId]) REFERENCES [dbo].[AdvertType]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
