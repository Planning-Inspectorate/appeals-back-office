#!/bin/bash
set -e

echo "Adding Google Chrome signing key and repository..."

# Modern key management
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor | sudo tee /usr/share/keyrings/google-linux-signing-key.gpg > /dev/null

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-signing-key.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | \
  sudo tee /etc/apt/sources.list.d/google-chrome.list > /dev/null

echo "Updating apt and installing Chrome..."

sudo apt-get update
sudo apt-get install -y google-chrome-stable

echo "✅ Google Chrome installed successfully"