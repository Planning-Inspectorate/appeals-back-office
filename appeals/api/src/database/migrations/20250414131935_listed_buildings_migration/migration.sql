/*
  Warnings:

  - Made the column `listEntry` on table `ListedBuildingSelected` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;


-- CreateTable
CREATE TABLE [dbo].[ListedBuilding] (
    [reference] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [grade] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ListedBuilding_pkey] PRIMARY KEY CLUSTERED ([reference])
);

-- CreateTable
CREATE TABLE [dbo].[MigrateListedBuildingSelected] (
    [lpaQuestionnaireId] INT NOT NULL,
    [listEntry] NVARCHAR(1000) NOT NULL,
    [affectsListedBuilding] BIT NOT NULL,
    CONSTRAINT [MigrateListedBuildingSelected_pkey] PRIMARY KEY CLUSTERED ([lpaQuestionnaireId],[listEntry])
);

-- Fill migration data with existing records
INSERT INTO [dbo].[MigrateListedBuildingSelected] SELECT lpaQuestionnaireId, listEntry, affectsListedBuilding FROM [dbo].[ListedBuildingSelected];
DELETE FROM [dbo].[ListedBuildingSelected];

-- AlterTable
ALTER TABLE [dbo].[ListedBuildingSelected] ALTER COLUMN [listEntry] NVARCHAR(1000) NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[ListedBuildingSelected] ADD CONSTRAINT [ListedBuildingSelected_listEntry_fkey] FOREIGN KEY ([listEntry]) REFERENCES [dbo].[ListedBuilding]([reference]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
