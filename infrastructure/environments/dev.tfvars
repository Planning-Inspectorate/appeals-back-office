environment        = "dev"
vnet_address_space = "10.15.0.0/24"

# vnet_subnets = [
#   {
#     "name" : "AzureBastionSubnet",
#     "new_bits" : 4 # /28
#     service_endpoints  = []
#     service_delegation = []
#   },
#   {
#     "name" : "FunctionAppSubnet",
#     "new_bits" : 4 # /28
#     service_endpoints = ["Microsoft.Storage", "Microsoft.KeyVault", "Microsoft.ServiceBus"]
#     service_delegation = [
#       {
#         delegation_name = "Microsoft.Web/serverFarms"
#         actions         = ["Microsoft.Network/virtualNetworks/subnets/action"]
#       }
#     ]
#   },
#   {
#     "name" : "SynapseEndpointSubnet",
#     "new_bits" : 2 # /26
#     service_endpoints  = []
#     service_delegation = []
#   },
#   {
#     "name" : "ComputeSubnet"
#     "new_bits" : 2 # /26
#     service_endpoints  = ["Microsoft.Storage", "Microsoft.KeyVault"]
#     service_delegation = []
#   },
#   {
#     "name" : "ApimSubnet",
#     "new_bits" : 2 # /26
#     service_endpoints  = []
#     service_delegation = []
#   },
# ]
