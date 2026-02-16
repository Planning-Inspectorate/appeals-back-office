BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[CalendarDate] (
    [currentDate] DATE NOT NULL,
    [isWeekend] BIT NOT NULL,
    [isBankHoliday] BIT NOT NULL,
    CONSTRAINT [CalendarDate_pkey] PRIMARY KEY CLUSTERED ([currentDate])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [CalendarDate_isWeekend_isBankHoliday_idx] ON [dbo].[CalendarDate]([isWeekend], [isBankHoliday]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
