/*
  Warnings:

  - You are about to drop the column `externaAppealType` on the `AppealRelationship` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppealRelationship] DROP COLUMN [externaAppealType];
ALTER TABLE [dbo].[AppealRelationship] ADD [externalAppealType] NVARCHAR(1000),
[externalId] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
