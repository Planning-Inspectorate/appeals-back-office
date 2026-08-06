/*
  Warnings:

  - You are about to drop the column `estimatedTime` on the `InquiryEstimate` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Inquiry] ADD [estimatedDays] INT;

-- AlterTable
ALTER TABLE [dbo].[InquiryEstimate] DROP COLUMN [estimatedTime];
ALTER TABLE [dbo].[InquiryEstimate] ADD [preparationTime] DECIMAL(32,16),
[reportingTime] DECIMAL(32,16),
[sittingTime] DECIMAL(32,16);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
