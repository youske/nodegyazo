#!/bin/bash
set -e
ROLE=$1

sudo apt-get update

sudo apt-get install apt-file build-essential -y
sudo apt-get install git -y

# vmachine
if [ ${ROLE} = "vmachine" ] ; then
  echo "virtual machine provisioning"

  sudo apt-get install nodejs nodejs-legacy npm -y
  sudo apt-get install redis-tools redis-server -y
  sudo apt-get install imagemagick -y

  sudo npm install pm2 bower -g

fi
