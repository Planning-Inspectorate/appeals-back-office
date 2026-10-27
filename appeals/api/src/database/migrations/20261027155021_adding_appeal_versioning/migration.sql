/*
  Warnings:

  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `AppealTimetable` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `Hearing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `HearingEstimate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `Inquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `InquiryEstimate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `InspectorDecision` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appealId,associatedAppealVersion]` on the table `SiteVisit` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[AppealTimetable] DROP CONSTRAINT [AppealTimetable_appealId_key];

-- DropIndex
ALTER TABLE [dbo].[Hearing] DROP CONSTRAINT [Hearing_appealId_key];

-- DropIndex
ALTER TABLE [dbo].[HearingEstimate] DROP CONSTRAINT [HearingEstimate_appealId_key];

-- DropIndex
ALTER TABLE [dbo].[Inquiry] DROP CONSTRAINT [Inquiry_appealId_key];

-- DropIndex
ALTER TABLE [dbo].[InquiryEstimate] DROP CONSTRAINT [InquiryEstimate_appealId_key];

-- DropIndex
ALTER TABLE [dbo].[InspectorDecision] DROP CONSTRAINT [InspectorDecision_appealId_key];

-- DropIndex
ALTER TABLE [dbo].[SiteVisit] DROP CONSTRAINT [SiteVisit_appealId_key];

-- AlterTable
ALTER TABLE [dbo].[Appeal] ADD [currentAppealVersion] INT NOT NULL CONSTRAINT [Appeal_currentAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[AppealStatus] ADD [isDeleted] BIT NOT NULL CONSTRAINT [AppealStatus_isDeleted_df] DEFAULT 0;

-- AlterTable
ALTER TABLE [dbo].[AppealTimetable] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [AppealTimetable_associatedAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[Hearing] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [Hearing_associatedAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[HearingEstimate] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [HearingEstimate_associatedAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[Inquiry] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [Inquiry_associatedAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[InquiryEstimate] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [InquiryEstimate_associatedAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[InspectorDecision] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [InspectorDecision_associatedAppealVersion_df] DEFAULT 1;

-- AlterTable
ALTER TABLE [dbo].[SiteVisit] ADD [associatedAppealVersion] INT NOT NULL CONSTRAINT [SiteVisit_associatedAppealVersion_df] DEFAULT 1;

-- CreateIndex
ALTER TABLE [dbo].[AppealTimetable] ADD CONSTRAINT [AppealTimetable_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

-- CreateIndex
ALTER TABLE [dbo].[Hearing] ADD CONSTRAINT [Hearing_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

-- CreateIndex
ALTER TABLE [dbo].[HearingEstimate] ADD CONSTRAINT [HearingEstimate_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

-- CreateIndex
ALTER TABLE [dbo].[Inquiry] ADD CONSTRAINT [Inquiry_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

-- CreateIndex
ALTER TABLE [dbo].[InquiryEstimate] ADD CONSTRAINT [InquiryEstimate_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

-- CreateIndex
ALTER TABLE [dbo].[InspectorDecision] ADD CONSTRAINT [InspectorDecision_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

-- CreateIndex
ALTER TABLE [dbo].[SiteVisit] ADD CONSTRAINT [SiteVisit_appealId_associatedAppealVersion_key] UNIQUE NONCLUSTERED ([appealId], [associatedAppealVersion]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
