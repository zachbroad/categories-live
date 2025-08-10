# Categories.LIVE Infrastructure

Basic Terraform configuration for deploying Categories.LIVE to AWS EC2.

## Architecture

- **1 Backend EC2 Instance** - Runs the Node.js/Socket.IO game server
- **1 Frontend EC2 Instance** - Serves the React Router v7 web client

## Prerequisites

1. AWS Account with credentials configured
2. Terraform installed (>= 1.0)
3. AWS Key Pair created for SSH access

## Setup

1. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your configuration:
- Set your AWS region
- Update the AMI ID if needed
- Add your existing AWS key pair name

3. Initialize Terraform:
```bash
terraform init
```

4. Review the plan:
```bash
terraform plan
```

5. Deploy the infrastructure:
```bash
terraform apply
```

## Outputs

After deployment, Terraform will output:
- Public IP addresses for both instances
- Public DNS names
- SSH commands to connect to each instance

## Connecting to Instances

```bash
# Backend
ssh -i ~/.ssh/your-key.pem ubuntu@<backend-ip>

# Frontend  
ssh -i ~/.ssh/your-key.pem ubuntu@<frontend-ip>
```

## Destroying Infrastructure

To tear down all resources:
```bash
terraform destroy
```

## Security Notes

- Security groups are configured with basic rules
- SSH (port 22) is open to all IPs - restrict this in production
- Backend runs on port 3001
- Frontend serves on ports 80, 443, and 3000 (dev)

## Cost

Using t2.micro instances (free tier eligible if within AWS free tier limits)