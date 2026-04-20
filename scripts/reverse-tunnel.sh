#!/bin/sh
#
# Android Reverse Tunnel Connector
#
# This script establishes a reverse SSH tunnel from your Android device
# to your dashboard server. This is useful for devices behind a NAT/firewall.
#
# Prerequisites:
# 1. An SSH client installed on your device (e.g., via Termux).
# 2. An SSH key generated and authorized on the server, as described in the
#    Device Connection Wizard in the dashboard.
#
# Usage:
# ./reverse-tunnel.sh <user> <server_ip> <remote_port> [local_adb_port] [ssh_key_path]
#
# Parameters:
#   <user>           - Your SSH username on the server.
#   <server_ip>      - The IP address of your dashboard server.
#   <remote_port>    - The port on the server that will be forwarded to your device.
#                      This should match the 'Local Forwarded Port' in the dashboard's
#                      reverse tunnel device configuration.
#   [local_adb_port] - (Optional) The local ADB port on your device. Defaults to 5555.
#   [ssh_key_path]   - (Optional) Path to your private SSH key. Defaults to ~/.ssh/id_ed25519.
#
# Example:
# ./reverse-tunnel.sh myuser 123.45.67.89 15555

# --- Configuration ---
SERVER_USER=$1
SERVER_IP=$2
REMOTE_PORT=$3
LOCAL_PORT=${4:-5555}
SSH_KEY=${5:-~/.ssh/id_ed25519}

# --- Validation ---
if [ -z "$SERVER_USER" ] || [ -z "$SERVER_IP" ] || [ -z "$REMOTE_PORT" ]; then
    echo "Error: Missing required arguments."
    echo "Usage: $0 <user> <server_ip> <remote_port> [local_adb_port] [ssh_key_path]"
    exit 1
fi

echo "Attempting to create a reverse tunnel..."
echo "  Server: ${SERVER_USER}@${SERVER_IP}"
echo "  Forwarding: server port ${REMOTE_PORT} -> device port ${LOCAL_PORT}"
echo "  Using SSH key: ${SSH_KEY}"
echo "----------------------------------------------------"
echo "If the connection is successful, this script will run in the foreground."
echo "Press Ctrl+C to terminate the tunnel."

# --- Run Command ---
# -N: Do not execute a remote command. This is useful for just forwarding ports.
# -R: Specifies the reverse tunnel. Format is [bind_address:]port:host:hostport
#     Here, we forward port <REMOTE_PORT> on the server to port <LOCAL_PORT> on the localhost of the device.
ssh -N -R ${REMOTE_PORT}:localhost:${LOCAL_PORT} ${SERVER_USER}@${SERVER_IP} -i "${SSH_KEY}"

echo "Tunnel command exited."
