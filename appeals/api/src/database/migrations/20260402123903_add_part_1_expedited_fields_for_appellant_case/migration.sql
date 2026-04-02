BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] ADD [anySignificantChanges] NVARCHAR(1000),
[anySignificantChanges_courtJudgementSignificantChanges] NVARCHAR(max),
[anySignificantChanges_localPlanSignificantChanges] NVARCHAR(max),
[anySignificantChanges_nationalPolicySignificantChanges] NVARCHAR(max),
[anySignificantChanges_otherSignificantChanges] NVARCHAR(max),
[ownershipCertificate] BIT,
[reasonForAppealAppellant] NVARCHAR(1000),
[screeningOpinionIndicatesEiaRequired] BIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
