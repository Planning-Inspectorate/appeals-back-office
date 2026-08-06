BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[AppellantCase] ADD [contactPlanningInspectorateDate] DATETIME2,
[enforcementEffectiveDate] DATETIME2,
[enforcementIssueDate] DATETIME2,
[enforcementNoticeListedBuilding] BIT,
[enforcementReference] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
