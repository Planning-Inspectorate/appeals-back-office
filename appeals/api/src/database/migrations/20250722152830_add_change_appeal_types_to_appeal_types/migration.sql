/*
  Warnings:

  - A unique constraint covering the columns `[changeAppealType]` on the table `AppealType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `changeAppealType` to the `AppealType` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppealType] ADD [changeAppealType] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[AppealType] ADD CONSTRAINT [AppealType_changeAppealType_key] UNIQUE NONCLUSTERED ([changeAppealType]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
