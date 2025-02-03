/*
  Warnings:

  - You are about to drop the column `finalCommentReviewDate` on the `AppealTimetable` table. All the data in the column will be lost.
  - You are about to drop the column `statementReviewDate` on the `AppealTimetable` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppealTimetable] DROP COLUMN [finalCommentReviewDate],
[statementReviewDate];
ALTER TABLE [dbo].[AppealTimetable] ADD [appellantFinalCommentsDueDate] DATETIME2,
[appellantStatementDueDate] DATETIME2,
[ipCommentsDueDate] DATETIME2,
[lpaFinalCommentsDueDate] DATETIME2,
[lpaStatementDueDate] DATETIME2,
[s106ObligationDueDate] DATETIME2;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
