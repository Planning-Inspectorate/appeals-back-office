# Stored Procedures

Prisma does not explicitly handle stored procedures in the schema file.
However, you can still use stored procedures in your database and call them from your application code using raw SQL queries.

We can create and modify stored procedures by manually making migration SQL in the database/migrations folder.

However, to modify a stored procedure, we would need to make a new migration with the
updated SQL for the stored procedure. In git this would of course be a separate file - and so we would
lose the benefits of git versioning on that file. We would like to be able to see the changes on a single SQL script file.

To achieve this we will do the following:

1. keep our version-controlled stored procedure SQL scripts in a separate folder, e.g. `database/stored-procedures/`.

## Creating a new stored procedure:

2. create a new SQL script in the `database/stored-procedures/` folder with the SQL for the new stored procedure.
3. create a new manual prisma migration file in a prisma migration folder, and copy that script into it.
4. commit as usual to git.

## Modifying an existing stored procedure:

5. make the amendments to the existing stored procedure in the same SQL script in the `database/stored-procedures/` folder.
6. create a new manual prisma migration file in a prisma migration folder, and copy that script into it.
7. commit as usual to git.

This will ensure that we can version track the changes using the master in the `database/stored-procedures/` folder.

## Permissions

We will need to also ensure that the SQL user that the API connects to the database as
has the necessary permissions to execute stored procedures.
This can be done by either ensuring that that user is in a role that has execute permission,
or by explicitly granting execute permission to that user for the stored procedures.
