/*
  Warnings:

  - You are about to alter the column `originalRepresentation` on the `Representation` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(Max)`.
  - You are about to alter the column `redactedRepresentation` on the `Representation` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(Max)`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Representation] ALTER COLUMN [originalRepresentation] NVARCHAR(max) NULL;
ALTER TABLE [dbo].[Representation] ALTER COLUMN [redactedRepresentation] NVARCHAR(max) NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
