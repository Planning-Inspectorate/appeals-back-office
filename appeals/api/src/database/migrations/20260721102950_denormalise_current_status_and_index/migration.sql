BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Appeal] ADD [currentStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [Appeal_currentStatus_df] DEFAULT 'assign_case_officer';

-- populate current status
EXEC('
;WITH latestStatus AS (
    SELECT
        [appealId],
        [status],
        ROW_NUMBER() OVER (PARTITION BY [appealId] ORDER BY [createdAt] DESC) AS [rn]
    FROM [dbo].[AppealStatus]
    WHERE [valid] = 1
)
UPDATE [a]
SET [currentStatus] = [ls].[status]
FROM [dbo].[Appeal] [a]
INNER JOIN [latestStatus] [ls]
    ON [ls].[appealId] = [a].[id]
   AND [ls].[rn] = 1
');

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_currentStatus_idx] ON [dbo].[Appeal]([currentStatus]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_currentStatus_caseOfficerUserId_idx] ON [dbo].[Appeal]([currentStatus], [caseOfficerUserId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Appeal_currentStatus_inspectorUserId_idx] ON [dbo].[Appeal]([currentStatus], [inspectorUserId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
