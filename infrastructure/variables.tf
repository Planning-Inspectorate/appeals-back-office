# variables should be sorted A-Z

# ignored while we build up the terraform
# tflint-ignore: terraform_unused_declarations
variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}
