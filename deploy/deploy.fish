#!/usr/bin/env fish
cd (dirname (status filename))/../app; or exit 1
pnpm build; or exit 1
set J -J jarvis admin@192.168.100.15
ssh $J "mkdir -p ~/homelab/menufy/site"
scp -q -o ProxyJump=jarvis ../deploy/docker-compose.yml ../deploy/nginx.conf admin@192.168.100.15:homelab/menufy/
tar -C dist -c . | ssh $J "rm -rf ~/homelab/menufy/site/*; tar -C ~/homelab/menufy/site -x"
ssh $J "cd ~/homelab/menufy; docker compose up -d"
