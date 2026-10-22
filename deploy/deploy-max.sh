#!/bin/bash
# Build and publish from max itself (site/ is a bind mount, no container restart needed).
set -e
export PATH=$HOME/.local/bin:$PATH
cd "$(dirname "$0")/../app"
pnpm install --frozen-lockfile
pnpm build
S=/home/admin/homelab/menufy/site
rm -rf "${S:?}"/*
cp -r dist/. "$S"/
