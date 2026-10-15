#!/usr/bin/env fish
cd (dirname (status filename))/../app; or exit 1
pnpm build; or exit 1
set J max
ssh $J "mkdir -p /home/admin/homelab/menufy/site"
scp -q ../deploy/docker-compose.yml ../deploy/nginx.conf max:/home/admin/homelab/menufy/
tar -C dist -c . | ssh $J "rm -rf /home/admin/homelab/menufy/site/*; tar -C /home/admin/homelab/menufy/site -x"
ssh $J "cd /home/admin/homelab/menufy; docker compose up -d"
