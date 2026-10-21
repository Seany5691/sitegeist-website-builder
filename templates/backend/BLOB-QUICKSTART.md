# Vercel Blob - Quick Setup (2 Minutes)

## For THIS Website:

### 1. Deploy
```bash
git push
```

### 2. Create Blob in Vercel
- Dashboard → Storage → Create Blob
- Copy token

### 3. Add Token to Vercel
- Settings → Environment Variables
- `BLOB_READ_WRITE_TOKEN` = [paste token]
- Check all environments → Save

### 4. Redeploy Once
- Deployments → ... → Redeploy

### 5. Seed Blob (Local Machine)
```bash
# Add to .env.local:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Run:
node scripts/seed-blob.js
```

### 6. Test
- Dashboard → Make change → Save
- Refresh website → See changes! ✅

---

## For FUTURE Websites (Website Builder):

Same 6 steps above, takes 2 minutes per site.

**Code is already Blob-ready in template!**

---

## Costs

- **Pro Plan:** 100GB included ($20/month)
- **10-20 sites** fit easily
- **$0.15/GB** over 100GB

---

## How It Works

| Environment | Storage | Behavior |
|-------------|---------|----------|
| **Local dev** | Filesystem | No token needed |
| **Production** | Blob | Uses token, instant saves |

**Auto-detects!** No code changes needed between environments.

---

## Client Workflow

1. Login to dashboard
2. Edit content
3. Click save
4. Refresh website
5. **Changes live!** No rebuild! 🎉

---

See `docs/VERCEL-BLOB-GUIDE.md` for full details.
