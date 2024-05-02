# Infrastructure

This folder contains the infrastructure-as-code (using Terraform) for this project.

## Pipelines

There are two pipelines, one for static checks during PR, and only to plan and apply the infrastructure. These are based on common-pipeline-templates.

## Environments

Differences between environments are managed with simple tfvars files, found in the `environments` folder.
