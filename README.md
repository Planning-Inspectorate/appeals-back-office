# Planning Inspectorate Appeals Back-Office

Welcome the monorepo for the Planning Inspectorate Appeals Back-Office, a system to manage the processing of planning appeals submitted by the public (through the [Appeals Front-Office](https://github.com/Planning-Inspectorate/appeal-planning-decision/)).

The system is structured as a multi-tier application, designed to run on the Azure cloud and comprising of:

1. A web front-end utilising [server-side rendering](https://web.dev/rendering-on-the-web/#server-rendering) through the [Nunjucks templating language](https://mozilla.github.io/nunjucks/templating.html) and the [GOV.UK Design System](https://design-system.service.gov.uk/)
2. A JSON back-end API processing data stored in a [SQL database](https://learn.microsoft.com/en-us/azure/azure-sql/)
3. A shared [Azure Service Bus Namespace](https://learn.microsoft.com/en-us/azure/service-bus-messaging/), coordinating the exchange of business data between the Appeals Back-Office and other Planning Inspectorate applications
4. A shared [EntraID Instance](https://learn.microsoft.com/en-gb/entra/), handling logins, role-based access and general [OIDC protocol](https://openid.net/)
5. A shared [Azure Storage Account](https://learn.microsoft.com/en-us/azure/storage/), storing blob containers and blobs
6. A number of [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/), consuming messages from the Azure Service Bus and processing additional background tasks


> [!IMPORTANT]
> A detailed architectural overview is available as a set of [C4 model diagrams](docs/architecture/index.md)


## Getting Started

All apps in this monorepo are built with [Express.js](https://expressjs.com/). In order to contribute to the development of the Appeals Back-Office, the following prerequisites need to be installed locally:

1. [Node.js LTS](https://nodejs.org/en/) (installation through a Node version manager such as [Nvm](https://github.com/nvm-sh/nvm) is recommended)
2. [Docker](https://www.docker.com/products/docker-desktop)

Once the prerequisite software is installed, and the repository cloned, contributors can proceed to the setup and configuration of the system, as described in the basic setup guide.

> [Basic setup](docs/basic-setup.md)

With the system up and running locally, additional setup and configuration can enable secure features that are disabled by default

> [Advanced setup](docs/advanced-setup.md)

For additional information, please refer to the following documents:

* [web front-end](docs/web.md)
* [api back-end](docs/api.md)
* [integrations](docs/integrations.md)
* [horizon](docs/horizon.md)
* [notifications](docs/notifications.md)


## Licensing

[MIT](https://opensource.org/licenses/mit) © Planning Inspectorate
addhere
