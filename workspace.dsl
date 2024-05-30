workspace "Appeal service" {
	!docs architecture

	model {
		properties {
			"structurizr.groupSeparator" "/"
		}

		userLocalPlanningAuthority = person "LPA" "A local planning authority, issuing decisions on planning applications"
		userAppellant = person "Appellant" "A member of the public, or a representative, appealing against a planning decision"

		group "Planning Inspectorate: Appeal Service" {
			userCaseOfficer = person "Case officer" "Validates and manages case data, documents and general appeal processing"
			userInspector = person "Inspector" "Inspects the appeal site and issues appeal decisions"

			systemAppsFo = softwareSystem "Appeals Front-Office" "Public dashboards for appellants and LPAs" "Node.js, Azure Web App, Azure Function App" {
				tags "InternalCollaborationSystem"

				containerFoFileStorage = container "Blob storage for documents" "Stores all files uploaded in the Front-Office" "Node.js, Azure Web App, Azure Function App"
			}

			systemAppsBo = softwareSystem "Appeals Back-Office" "Internal service to manage planning appeals in England"  {

				group "Appeal Back-Office Web" {
    				containerBoWeb = container "Appeal Back-Office Web" "Web UI" "Node.js, Azure Web App" {
    					tags "Microsoft Azure - App Services"
    				}
    				containerBoRedis = container "Redis" "Distributed session storage" {
							tags "Microsoft Azure - Cache Redis"
						}
    				containerBoAzureActiveDirectory = container "Entra ID" "Authentication, RBAC" {
							tags "Microsoft Azure - Azure Active Directory"
						}
    				containerBoFileStorage = container "Storage Account" "Document storage" {
							tags "Microsoft Azure - Storage Accounts"
						}
				}

				group "Appeal Back-Office API" {
    				containerBoApi = container "Appeal Back-Office API" "API" "Node.js, Azure Web App" {
    					tags "Microsoft Azure - App Services"
    				}

    				containerBoAzureSql = container "Azure SQL Database" "Data store for appeals" "Azure SQL" {
							tags "Microsoft Azure - SQL Database" "Database"
						}
				}

				group "Azure functions" {
				    containerFunctionAppCasedata = container "Casedata import" "Consumes appellant and LPA submissions from Service Bus" "Function App, JavaScript"{
						tags "Microsoft Azure - Function Apps", "FunctionApp"
					}
					containerFunctionAppDocs = container "Document processing" "Copies blobs from Front-Office, processes virus scanning" "Function App, JavaScript"{
						tags "Microsoft Azure - Function Apps", "FunctionApp"
					}
				}
			}

			systemIntegration = softwareSystem "Integration Layer" "Distributed messaging platform to exchange data between applications" {
				tags "InternalCollaborationSystem"

				containerBoServiceBus = container "Service Bus" "Messaging platform for data exchange" "Azure Service Bus Namespace" {
					tags "Microsoft Azure - Azure Service Bus" "InternalCollaborationSystem"

					group "Commands" {
						componentCaseCmdTopic = component "Service Bus Appeal submission topic" "Appeal submission command"
						componentLpaqCmdTopic = component "Service Bus LPA submission topic" "LPA submission command"
					}
					group "Events" {
						componentCaseMessageTopic = component "Service Bus Appeal topic" "Appeal messages"
						componentDocumentMessageTopic = component "Service Bus Document topic" "Appeal document messages"
						componentServiceUserMessageTopic = component "Service Bus Service User topic" "Service user messages"
						componentEventMessageTopic = component "Service Bus Event topic" "Event message"
					}
				}

				containerODW = container "Operational Data Warehouse (ODW)" "Holds all Planning Inspectorate data so that it can be used for internal purposes" {
				  tags "Microsoft Azure - Azure Synapse Analytics" "InternalCollaborationSystem"
				}

				containerEventGrid = container "Azure Event Grid", "Reports virus scan results for uploaded blobs" {
					tags "Microsoft Azure - Event Grid Topics" "InternalCollaborationSystem"
				}
			}

		}

		systemGovUk = softwareSystem "GOV Notify" "UK government messaging platform for sending emails, text and letters to users" {
			tags = "ExternalSystem"
			containerGovNotify = container "GOV Notify" "UK government messaging platform for sending emails, text and letters to users"
		}

		# Relationships

		userCaseOfficer -> systemAppsBo "Manages cases" "HTML/HTTPS"
		userInspector -> systemAppsBo "Decides cases" "HTML/HTTPS"
		userAppellant ->  systemAppsFo "Registers appeals" "HTML/HTTPS"
		userLocalPlanningAuthority ->  systemAppsFo "Responds to appeals" "HTML/HTTPS"
		containerGovNotify -> userLocalPlanningAuthority "Notifies the LPA" "Email"
		containerGovNotify -> userAppellant "Notifies the appellant" "Email"

		systemAppsFo -> componentCaseCmdTopic "Records appellant submissions" "Service Bus Topic" "ServiceBus"
		systemAppsFo -> componentLpaqCmdTopic "Records LPA submissions" "Service Bus Topic" "ServiceBus"
		systemAppsBo -> componentCaseMessageTopic "Records changes to appeals" "Service Bus Topic" "ServiceBus"
		systemAppsBo -> componentDocumentMessageTopic "Records changes to documents" "Service Bus" "ServiceBus"
		systemAppsBo -> componentServiceUserMessageTopic "Records changes to user information" "Service Bus Topic" "ServiceBus"
		systemAppsBo -> componentEventMessageTopic "Records changes to site visits and other events" "Service Bus Topic" "ServiceBus"

		componentCaseCmdTopic -> containerFunctionAppCasedata "Requests the creation of appeals" "Service Bus Topic" "ServiceBus"
		componentLpaqCmdTopic -> containerFunctionAppCasedata "Requests the addition of LPA responses to appeals" "Service Bus Topic" "ServiceBus"

		componentCaseMessageTopic -> containerODW "Informs subscribers of changes to appeals" "Service Bus Topic" "ServiceBus"
		componentDocumentMessageTopic -> containerODW "Informs subscribers of changes to documents" "Service Bus Topic" "ServiceBus"
		componentServiceUserMessageTopic -> containerODW "Informs subscribers of changes to service users information" "Service Bus Topic" "ServiceBus"
		componentEventMessageTopic -> containerODW "Informs subscribers of changes to site visits and other events" "Service Bus Topic" "ServiceBus"

		componentCaseMessageTopic -> systemAppsFo "Informs subscribers of changes to appeals" "Service Bus Topic" "ServiceBus"
		componentDocumentMessageTopic -> systemAppsFo "Informs subscribers of changes to documents" "Service Bus Topic" "ServiceBus"
		componentServiceUserMessageTopic -> systemAppsFo "Informs subscribers of changes to service users information" "Service Bus Topic" "ServiceBus"
		componentEventMessageTopic -> systemAppsFo "Informs subscribers of changes to site visits and other events" "Service Bus Topic" "ServiceBus"

		containerBoWeb -> containerBoRedis "Reads and writes cache and session data"
		containerBoWeb -> containerBoApi "Invokes functionality"
		containerBoWeb -> containerBoAzureActiveDirectory "Handle logins and permissions"
		containerBoWeb -> containerBoFileStorage "Reads and writes files to blob storage"
		containerBoApi -> containerBoAzureSql "Reads and writes data to database"
		containerBoApi -> containerGovNotify "Sends emails" "Email"

		containerFunctionAppCasedata -> containerBoApi "Imports case data from Front-Office"
		containerEventGrid -> containerFunctionAppDocs "Reports virus scan results" "Event Grid Topic"
		containerFunctionAppDocs -> containerBoApi "Forwards virus scan results"
		containerFunctionAppDocs -> containerFoFileStorage "Copies documents to import"
		containerFunctionAppDocs -> containerBoFileStorage "Stores imported documents"
	}

	views {
		properties {
			"structurizr.sort" "created"
		}

		systemLandscape "SystemLandscape" {
			include *
			autoLayout lr
			title "System Landscape"
		}

		systemContext systemAppsFo "AppealsFOContext" {
			include *
			autoLayout lr
			title "Appeals Front-Office Context"
		}

		systemContext systemAppsBo "AppealsBOContext" {
			include *
			autoLayout lr
			title "Appeals Back-Office Context"
		}

		container systemAppsBo "AppealsBOSystem" {
			include *
			autoLayout lr
			title "Appeals Back-Office System"
		}

		systemContext systemIntegration "IntegrationContext" {
			include *
			autoLayout lr
			title "Integration Context"
		}

		container systemIntegration "IntegrationSystem" {
			include *
			autoLayout lr
			title "Integration System"
		}

		component containerBoServiceBus "IntegrationComponents" {
			include *
			autoLayout lr
			title "Integration Components"
		}

		# Azure icons only
		theme default
		theme https://static.structurizr.com/themes/microsoft-azure-2023.01.24/icons.json

		styles {

			element Database {
				shape Cylinder
			}

			element "Person" {
				shape Person
			}

			element ExternalSystem {
				background #AAAAAA
			}

			element LegacySystem {
				background #CCCCCC
			}

			element InternalCollaborationSystem {
				background #888888
			}

			relationship ServiceBus {
					style dotted
			}
		}
	}
}
