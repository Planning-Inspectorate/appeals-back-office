# Put vars in alphabetical order a-z

variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}

variable "location" {
  description = "The short-format Azure region into which resources will be deployed"
  type        = string
}

# variable "tags" {
#   default     = {}
#   description = "A collection of tags to assign to taggable resources"
#   type        = map(string)
# }
