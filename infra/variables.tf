variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (Ubuntu 22.04 LTS in us-east-1)"
  type        = string
  default     = "ami-0e2c8caa4b6378d8c"
}

variable "backend_instance_type" {
  description = "Instance type for backend EC2"
  type        = string
  default     = "t2.micro"
}

variable "frontend_instance_type" {
  description = "Instance type for frontend EC2"
  type        = string
  default     = "t2.micro"
}

variable "key_pair_name" {
  description = "Name of the AWS key pair for SSH access"
  type        = string
}