# Tor Hidden Service Configuration for Anonymous Chat
# 
# Instructions for setting up your anonymous chat as a Tor hidden service:

## Step 1: Install Tor
# Windows: Download from https://www.torproject.org/download/
# The Tor Expert Bundle is recommended for running as a service

## Step 2: Create Tor configuration
# Create a file called torrc in your Tor installation directory with these contents:

# Basic Tor Configuration
SocksPort 9050
ControlPort 9051
CookieAuthentication 1

# Hidden Service Configuration
HiddenServiceDir C:\tor-data\anonymous-chat\
HiddenServicePort 80 127.0.0.1:3000

## Step 3: Directory Structure
# Tor will automatically create the hidden service directory and generate:
# - hostname (contains your .onion address)
# - private_key (keep this secret!)
# - hs_ed25519_public_key
# - hs_ed25519_secret_key

## Step 4: Starting Services
# 1. Start Tor with: tor -f torrc
# 2. Start the chat server with: npm start
# 3. Your .onion address will be in C:\tor-data\anonymous-chat\hostname

## Security Notes:
# - Keep your private keys secure and backed up
# - The chat server only listens on localhost (127.0.0.1)
# - Access code (UWO2025!) provides additional authentication layer
# - Room auto-locking prevents abandoned rooms from accumulating messages

## Optional: Run as Windows Service
# You can use tools like NSSM to run both Tor and the chat server as Windows services
