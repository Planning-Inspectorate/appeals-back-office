# variables should be sorted A-Z

variable "environment" {
  description = "The name of the environment in which resources will be deployed"
  type        = string
}

variable "tags" {
  description = "A collection of tags to assign to taggable resources"
  type        = map(string)
  default     = {}
}