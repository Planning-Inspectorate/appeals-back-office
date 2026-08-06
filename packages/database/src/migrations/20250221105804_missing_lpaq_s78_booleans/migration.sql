BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [hasConsultationResponses] BIT,
[hasEmergingPlan] BIT,
[hasSupplementaryPlanningDocs] BIT,
[hasTreePreservationOrder] BIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
