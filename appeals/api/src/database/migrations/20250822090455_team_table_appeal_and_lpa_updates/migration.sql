BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Appeal] ADD [assignedTeamId] INT;

-- AlterTable
ALTER TABLE [dbo].[LPA] ADD [teamId] INT;

-- CreateTable
CREATE TABLE [dbo].[Team] (
    [id] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    CONSTRAINT [Team_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Team_name_key] UNIQUE NONCLUSTERED ([name])
);

-- AddForeignKey
ALTER TABLE [dbo].[Appeal] ADD CONSTRAINT [Appeal_assignedTeamId_fkey] FOREIGN KEY ([assignedTeamId]) REFERENCES [dbo].[Team]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LPA] ADD CONSTRAINT [LPA_teamId_fkey] FOREIGN KEY ([teamId]) REFERENCES [dbo].[Team]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
