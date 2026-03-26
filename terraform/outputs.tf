output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.finvault.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.finvault.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.finvault.public_dns
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.finvault_sg.id
}

output "security_group_name" {
  description = "Name of the security group"
  value       = aws_security_group.finvault_sg.name
}

output "backend_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_instance.finvault.public_ip}:8080"
}

output "frontend_url" {
  description = "URL to access the frontend application"
  value       = "http://${aws_instance.finvault.public_ip}:3000"
}
