BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[NextBusinessDate] (
    [currentDate] DATE NOT NULL,
    [noBusinessDays] INT NOT NULL,
    [businessDate] DATE NOT NULL,
    CONSTRAINT [NextBusinessDate_pkey] PRIMARY KEY CLUSTERED ([currentDate],[noBusinessDays])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [NextBusinessDate_businessDate_idx] ON [dbo].[NextBusinessDate]([businessDate]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
