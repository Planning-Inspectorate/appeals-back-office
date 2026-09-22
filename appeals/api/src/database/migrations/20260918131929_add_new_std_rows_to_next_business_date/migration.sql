-- A2-9295 Sep 2026
-- Changes to the Personal List Due Date Business rules in A2-8815 mean that there are new stanrdard numbers of
-- business days to add to a date.  Therefore we need rows for these in the table.
-- was 5, 30, and 40.
-- Now also need 10, 25, 35, and 45 business days (2, 5, 7, and 9 weeks).
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 5;
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 10;
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 25;
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 30;
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 35;
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 40;
EXEC dbo.spPopulateNextBusinessDates @BusinessDays = 45;
