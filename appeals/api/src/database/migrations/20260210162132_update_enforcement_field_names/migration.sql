BEGIN TRY

BEGIN TRAN;

-- AlterTable:
ALTER TABLE [dbo].[LPAQuestionnaire] ADD
[areaOfAllegedBreachInSquareMetres] DECIMAL(32,16),
[floorSpaceCreatedByBreachInSquareMetres] DECIMAL(32,16);

-- Drop old columns
ALTER TABLE [dbo].[LPAQuestionnaire] DROP COLUMN
[doesAllegedBreachCreateFloorSpace],
[hasAllegedBreachArea];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

