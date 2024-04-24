# I think a legal hold is now an Azure feature
#
/*
  The ability to apply a Legal Hold on a blob container is currently not supported
  by terraform, so the approach is to import this module that runs an Azure CLI
  script to apply it once the resource has been provisioned.
*/
resource "null_resource" "apply_blob_container_legal_hold" {
  count = length(var.blob_store_account_container_pairs)

  triggers = {
    blob_account_name   = var.blob_store_account_container_pairs[count.index].blob_account_name
    blob_container_name = var.blob_store_account_container_pairs[count.index].blob_container_name
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<EOT
			az storage container legal-hold set \
				--account-name "${self.triggers.blob_account_name}" \
				--container-name "${self.triggers.blob_container_name}" \
				--tags "${join(" ", var.legal_hold_tags)}"
		EOT
  }
}

# Variables

variable "blob_store_account_container_pairs" {
  description = "A list of blob storage account and container name pairs"
  type        = list(object({ blob_account_name = string, blob_container_name = string }))
  default = [
    {
      blob_account_name   = "blob-account1",
      blob_container_name = "blob-container1"
    },
    {
      blob_account_name   = "blob-account1",
      blob_container_name = "blob-container2"
    },
    {
      blob_account_name   = "blob-account2",
      blob_container_name = "blob-container3"
    }
  ]
}

variable "legal_hold_tags" {
  description = "A list of tags associated with the Legal Hold"
  type        = list(string)
  default     = ["LegalHold"]
}

# Should this be under modules or it's OK here in components
