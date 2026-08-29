# Basic setup guide

The application can run with a number of components disabled, and this basic setup guide describes the minimum configuration required to get contributors started.

## Node.js

Once the repository is cloned on the local computer, the first step is to install the node packages required by all apps in the monorepo, using `npm`. The following command needs to run from the root of the codebase, and will install the `node_modules` required by all apps.

```shell
> npm ci
```

Once the command executes, it will create and download `node_modules` in the root folder, and link the specific required dependencies of each application in the nested folder structure:

- `./appeals/web`
- `./appeals/api`
- `./appeals/e2e`
- `./appeals/functions/*`

## SQL server

The main requirement to have the applications up and running is the installation of a SQL server Docker container.

```shell
docker run --cap-add SYS_PTRACE -e 'ACCEPT_EULA=1' -e 'MSSQL_SA_PASSWORD=<YourStrong@Passw0rd>' -p 1433:1433 --name pins_sql_server -d mcr.microsoft.com/azure-sql-edge
```

The above command will download and install the latest Azure SQL Edge image, which will result in a new docker container named `pins_sql_server` and runnning on the default port.

## Environment settings

The web front-end and API back-end require `.env` files created in their respective folders (`./appeals/web` and `./appeals/api`). There are some example files (`.env.example`) in both locations. These can be copied and renamed in place.

## Running migrations / seeding test data

The API back-end connects to the SQL database through the `DATABASE_URL` environment variable in the `.env` file created in the previous step.

The API back-end uses the [Prisma ORM](https://www.prisma.io/orm), and it is necessary to run migrations (the history of the database structure) and seeding (the test data) to have some data to work with.

```shell
appeals/api> npm run db:migrate
```

On the first run, the migration command above will:

1. Create the database
2. Run the history of migrations available in `./appeals/api/src/database/migrations`
3. Populate the database with seed data

If the database already exists, the existing seed data can be refreshed (deleted and re-created) using the seed command.

```shell
appeals/api> npm run db:seed
```

## Running the applications

Once the above steps are done, the individual applications can be run from their own location:

```shell
appeals/api> npm run dev
appeals/web> npm run dev
```

Or from the root folder:

```shell
> npm run api
> npm run web
```

Or by spawning multiple Node.js processes in the same terminal, from the root folder:

```shell
> npm run dev
```

The individual applications should now be available on the default configuration, on the endpoints:

- http://localhost:8080 (web)
- http://localhost:3999 (api)

> [!IMPORTANT]
> The basic described above setup allows to run the application and make contributions on the standard functionality, but will disable some important features. An [advanced setup](advanced-setup.md) is required for these additional scenarios.
