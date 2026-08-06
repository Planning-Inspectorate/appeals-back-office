/*
  Warnings:

  - You are about to drop the column `appellantFinalCommentsDueDate` on the `AppealTimetable` table. All the data in the column will be lost.
  - You are about to drop the column `lpaFinalCommentsDueDate` on the `AppealTimetable` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppealTimetable] DROP COLUMN [appellantFinalCommentsDueDate],
[lpaFinalCommentsDueDate];
ALTER TABLE [dbo].[AppealTimetable] ADD [finalCommentsDueDate] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
