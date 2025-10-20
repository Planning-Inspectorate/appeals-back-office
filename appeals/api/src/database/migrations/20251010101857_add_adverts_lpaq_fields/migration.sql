BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[LPAQuestionnaire] ADD [didAppellantSubmitCompletePhotosAndPlans] BIT,
[isSiteInAreaOfSpecialControlAdverts] BIT,
[wasApplicationRefusedDueToHighwayOrTraffic] BIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
