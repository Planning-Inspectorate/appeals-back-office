/*
  Warnings:

  - You are about to drop the column `groundABarred` on the `Appeal` table. All the data in the column will be lost.
  - You are about to drop the column `otherInformation` on the `Appeal` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Appeal] DROP COLUMN [groundABarred],
[otherInformation];

-- CreateTable
CREATE TABLE [dbo].[EnforcementNoticeAppealOutcome] (
    [id] INT NOT NULL IDENTITY(1,1),
    [appealId] INT NOT NULL,
    [groundABarred] BIT,
    [otherInformation] NVARCHAR(1000),
    [enforcementNoticeInvalid] NVARCHAR(1000),
    [otherLiveAppeals] NVARCHAR(1000),
    CONSTRAINT [EnforcementNoticeAppealOutcome_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EnforcementNoticeAppealOutcome_appealId_key] UNIQUE NONCLUSTERED ([appealId])
);

-- AddForeignKey
ALTER TABLE [dbo].[EnforcementNoticeAppealOutcome] ADD CONSTRAINT [EnforcementNoticeAppealOutcome_appealId_fkey] FOREIGN KEY ([appealId]) REFERENCES [dbo].[Appeal]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
