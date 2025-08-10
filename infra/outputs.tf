output "backend_public_ip" {
  description = "Public IP address of the backend EC2 instance"
  value       = aws_instance.backend.public_ip
}

output "backend_public_dns" {
  description = "Public DNS of the backend EC2 instance"
  value       = aws_instance.backend.public_dns
}

output "frontend_public_ip" {
  description = "Public IP address of the frontend EC2 instance"
  value       = aws_instance.frontend.public_ip
}

output "frontend_public_dns" {
  description = "Public DNS of the frontend EC2 instance"
  value       = aws_instance.frontend.public_dns
}

output "backend_ssh_command" {
  description = "SSH command to connect to backend"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.backend.public_ip}"
}

output "frontend_ssh_command" {
  description = "SSH command to connect to frontend"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_instance.frontend.public_ip}"
}