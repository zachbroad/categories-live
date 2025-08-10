terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security Group for Backend
resource "aws_security_group" "backend_sg" {
  name        = "categories-backend-sg"
  description = "Security group for Categories.LIVE backend"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend server port"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "categories-backend-sg"
  }
}

# Security Group for Frontend
resource "aws_security_group" "frontend_sg" {
  name        = "categories-frontend-sg"
  description = "Security group for Categories.LIVE frontend"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Development server port"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "categories-frontend-sg"
  }
}

# Backend EC2 Instance
resource "aws_instance" "backend" {
  ami           = var.ami_id
  instance_type = var.backend_instance_type
  key_name      = var.key_pair_name

  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    # Update system
    sudo apt-get update
    sudo apt-get upgrade -y
    
    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install pnpm
    npm install -g pnpm
    
    # Install git
    sudo apt-get install -y git
    
    # Install PM2 for process management
    npm install -g pm2
  EOF

  tags = {
    Name = "categories-backend"
    Type = "backend"
  }
}

# Frontend EC2 Instance
resource "aws_instance" "frontend" {
  ami           = var.ami_id
  instance_type = var.frontend_instance_type
  key_name      = var.key_pair_name

  vpc_security_group_ids = [aws_security_group.frontend_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    # Update system
    sudo apt-get update
    sudo apt-get upgrade -y
    
    # Install Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install pnpm
    npm install -g pnpm
    
    # Install git
    sudo apt-get install -y git
    
    # Install nginx for serving the frontend
    sudo apt-get install -y nginx
    
    # Install PM2 for process management
    npm install -g pm2
  EOF

  tags = {
    Name = "categories-frontend"
    Type = "frontend"
  }
}