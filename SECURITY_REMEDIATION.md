# Security remediation — manual runbook (not executed)

Status: the leaked Supabase **service-role key has already been revoked**, but the
revoked value is **still present in Git history**. Rotation stops new abuse;
only a coordinated history rewrite + force-push removes the value from clones,
forks and CI caches. **Nothing below was executed by the hardening agent.**
Do not paste the full leaked key into chat, tickets or shell history — use a
short unique prefix or a private file with `0600` permissions.

Repo: `https://github.com/ironlukas1/menufy.git` (replace with the real URL if
the remote changed). Use `<PROJECT_REF>` for the Supabase project reference.

## 1. Rotate and contain the Supabase key

1. Supabase Dashboard → **Project Settings → API → Secret keys**: confirm the
   old `service_role` / legacy JWT is revoked, then create a **new** service
   key. If the project uses `sb_secret_*`, rotate that value instead.
2. Store the new key only in the deployment's server-side secret store (e.g.
   GitHub Actions secret `SUPABASE_SERVICE_ROLE_KEY`) or an untracked local
   `.env.local`. **Never** put it in `VITE_*`, `NEXT_PUBLIC_*`,
   `EXPO_PUBLIC_*`, `deploy/docker-compose.yml`, `app/**` or `backend/**`.
3. Restart the API so it picks up the new key; verify with the database health
   endpoint: `curl -fsS https://menufy.misaligned.dev/api/v1/health`.
4. Confirm the old key is dead (expect HTTP 401/403):

   ```sh
   curl -sS -o /dev/null -w '%{http_code}\n' \
     -H 'apikey: <OLD_REVOKED_KEY>' \
     -H 'Authorization: Bearer <OLD_REVOKED_KEY>' \
     'https://<PROJECT_REF>.supabase.co/rest/v1/restaurants?select=id&limit=1'
   ```

5. Rotate any other credential committed alongside it (deploy SSH key, Expo
   tokens, Google Places key) if it shares the same exposure window.

## 2. Audit Supabase logs and data

1. Dashboard → **Logs**: review API, Postgres and Auth logs from the date of
   the first commit containing the key until rotation. Find the commit date
   with `git log --all --format='%h %ad %s' --date=iso -- server/.env.local`.
2. Look for requests using the leaked key from unexpected IPs/regions, bulk
   reads, unexpected `service_role` writes, new `auth.users`, or changes to
   `restaurants`, `restaurant_users`, `storage.objects`.
3. Run read-only checks in the SQL editor (never write during the audit):

   ```sql
   select id, name, public from storage.buckets where id = 'restaurant-images';
   select policyname, roles, qual, with_check from pg_policies
    where schemaname = 'storage' and tablename = 'objects';
   select bucket_id, name, owner, created_at from storage.objects
    where bucket_id = 'restaurant-images' order by created_at desc limit 100;
   ```

   The bucket must be `public = false`; pending photos must not be publicly
   readable. Investigate any object or policy created during the exposure.
4. Check project usage/billing graphs for abnormal traffic, and export the
   relevant logs before retention expires.

## 3. Remove the value from Git history (all branches and tags)

Work on a **fresh mirror clone**, never on the working copy. No tags existed at
the time of this audit, but the procedure covers tags and every other ref.
Choose one tool; do not run both.

### Option A — git-filter-repo (preferred)

```sh
git clone --mirror https://github.com/ironlukas1/menufy.git /tmp/menufy-clean.git
cd /tmp/menufy-clean.git
printf 'literal:<UNIQUE_LEAKED_KEY_PREFIX>==>[REDACTED-REVOKED-KEY]\n' > /tmp/menufy-replace.txt
git filter-repo --replace-text /tmp/menufy-replace.txt --force

# Alternative if whole config files should disappear instead of being replaced:
# git filter-repo --invert-paths \
#   --path server/.env.local \
#   --path expo-preview/.env.local \
#   --path expo-preview/.expo/settings.json \
#   --path expo-preview/.expo/devices.json --force
```

`--mirror` plus `filter-repo` rewrites **all branches, tags and refs** and
expires reflogs automatically.

### Option B — BFG Repo-Cleaner

```sh
git clone --mirror https://github.com/ironlukas1/menufy.git /tmp/menufy-bfg.git
cd /tmp/menufy-bfg.git
printf '<UNIQUE_LEAKED_KEY_PREFIX>==>[REDACTED-REVOKED-KEY]\n' > /tmp/menufy-replace.txt
java -jar bfg.jar --replace-text /tmp/menufy-replace.txt --no-blob-protection .
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Verify before pushing

```sh
git log --all --oneline -S '<UNIQUE_LEAKED_KEY_PREFIX>'   # must be empty
git grep -I -n -F '<UNIQUE_LEAKED_KEY_PREFIX>' \
  $(git for-each-ref --format='%(refname)') || echo 'clean'
git show-ref                                  # confirm all branches/tags present
```

Review the rewritten tip of every branch; confirm no other secrets or
unintended file deletions were introduced.

## 4. Force-push — explicit approval required first

**STOP. Do not run these commands until the user explicitly approves a
force-push in writing.** Announce a maintenance window, freeze merges, enable
branch protection after the push, and coordinate with every collaborator.

```sh
# ONLY AFTER EXPLICIT APPROVAL:
git push --force --all origin
git push --force --tags origin
```

If approval is withheld, keep the key revoked (already done) and leave the
historical value in place; do not attempt any cleanup on your own.

## 5. Collaborator re-clone

1. Every collaborator must **discard old clones** and re-clone from scratch:

   ```sh
   git clone https://github.com/ironlukas1/menufy.git menufy-fresh
   ```

2. If a clone must be kept, back up untracked local config first, then:

   ```sh
   git fetch origin
   git reset --hard origin/main
   git clean -fdx        # WARNING: deletes untracked files, e.g. .env.local
   ```

3. Re-enter any local secrets by hand; never restore them from the old commit
   objects. Verify `git log -S '<UNIQUE_LEAKED_KEY_PREFIX>' --all` is empty.

## 6. Forks, caches and other copies

1. Delete or rewrite forks of the repository; ask fork owners to re-clone.
   GitHub may keep cached views of old commits — contact GitHub Support to
   purge cached/sha1 references if sensitive data was viewed.
2. Purge CI/build caches that may contain the old checkout or built artifacts:

   ```sh
   gh cache delete --all --repo ironlukas1/menufy   # if the CLI cache API is enabled
   docker builder prune --all                      # on the deploy host
   ```

3. Clear the deploy host's old checkout/backup copies, CDN caches for built
   assets, and local pnpm/npm caches holding old tarballs. Rotate the deploy
   SSH key if it was ever exposed or shared through the same channel.

## 7. CI secret scanning (prevent recurrence)

1. GitHub → **Settings → Code security**: enable **Secret scanning** and
   **Push protection** for the repo (and organization-wide if available).
2. Add a scheduled + pull-request workflow using `gitleaks` or `trufflehog`:

   ```sh
   gitleaks detect --source . --log-opts='--all' --redact   # full history
   gitleaks protect --staged --redact                      # pre-commit hook
   ```

   Run the history scan once against the rewritten repo, then enforce the
   staged-scan on commits/PRs; fail the job on any finding and maintain a
   documented, time-boxed allowlist for false positives.
3. Keep the existing CI guard: any GitHub Actions secret named
   `VITE_*`/`NEXT_PUBLIC_*` containing `SECRET|SERVICE|TOKEN|PASSWORD|KEY`
   fails the deploy job, with one reviewed exception for names ending in
   `PUBLISHABLE_KEY` (client-safe by design, e.g.
   `VITE_SUPABASE_PUBLISHABLE_KEY`). The staged browser bundle is also scanned
   for secret-shaped values before shipping.
4. Add a repo rule/checklist: no `.env.local`, storage keys, signing keys or
   `google-services.json` in commits; root `.gitignore` now ignores them, but
   it does not remove values already in history.

## Scope of the completed hardening (no destructive actions performed)

- Root `.gitignore` added; tracked config/secret artifacts were removed from
  the Git **index only** (`git rm --cached`), files left on disk.
- Generated artifacts were also untracked from the index only:
  `server/.next/` (546 files), `expo-preview/node_modules/` (31,661 files) and
  `server/node_modules/` (12,118 files). This removes them from future commits,
  but they remain in existing Git history until the rewrite in section 3.
- `restaurant-images` forced private in a new SQL migration; legacy scripts
  no longer upsert `public = true`.
- Nginx request/connection limits, upload size and security headers added;
  Actions pinned and verified; compose passes no service-role key.
- No DB was touched; no history rewrite, commit, push or force-push was
  performed. Application builds and test suites were run locally only.
