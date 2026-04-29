BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [anySignificantChangesLpa] NVARCHAR(1000),
[anySignificantChangesLpa_courtJudgementSignificantChanges] NVARCHAR(max),
[anySignificantChangesLpa_localPlanSignificantChanges] NVARCHAR(max),
[anySignificantChangesLpa_nationalPolicySignificantChanges] NVARCHAR(max),
[anySignificantChangesLpa_otherSignificantChanges] NVARCHAR(max),
[listOfDocumentsBeforeDecision] NVARCHAR(max);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
