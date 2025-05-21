BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Appeal] ADD [caseTeamId] INT;

-- CreateTable
CREATE TABLE [dbo].[CaseTeam] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [CaseTeam_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CaseTeam_email_key] UNIQUE NONCLUSTERED ([email])
);

-- AddForeignKey
ALTER TABLE [dbo].[Appeal] ADD CONSTRAINT [Appeal_caseTeamId_fkey] FOREIGN KEY ([caseTeamId]) REFERENCES [dbo].[CaseTeam]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
