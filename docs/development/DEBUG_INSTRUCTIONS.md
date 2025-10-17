# Debug Instructions - API Connection Issues

## ⚡ QUICK FIX (Start Here!)

**Problem**: Homepage shows "0 cas cliniques" and "0 fiches"

**Solution**: Browser cache issue. Do a **hard refresh**:
- **Mac Chrome/Firefox**: `Cmd + Shift + R`
- **Mac Safari**: `Cmd + Option + R`
- **Windows**: `Ctrl + Shift + R` or `Ctrl + F5`

**Or** visit http://localhost:3001/debug and click "Vider le cache et recharger"

👉 See [QUICK_FIX_ZERO_RESULTS.md](QUICK_FIX_ZERO_RESULTS.md) for detailed instructions.

---

## Problem
Catalog page and Fiches page showing 0 results despite backend having 674 cases and 317 fiches.

## Verification Steps

### 1. Verify Backend is Running
```bash
curl http://localhost:3000/health
```
Expected: `{"status":"healthy",...}`

### 2. Verify Data Exists
```bash
curl http://localhost:3000/api/v1/stats
curl http://localhost:3000/api/v1/fiches/stats
```
Expected: 674 cases, 317 fiches

### 3. Test API Endpoints Directly
```bash
curl "http://localhost:3000/api/v1/cases?limit=5"
curl "http://localhost:3000/api/v1/fiches?limit=5"
```

## Debug Page

Visit **http://localhost:3001/debug** in your browser.

This page will:
- ✅ Test all API connections
- ✅ Show actual data returned
- ✅ Display any error messages
- ✅ Log to browser console

## Common Solutions

### Solution 1: Hard Refresh Browser
The issue might be cached JavaScript:

**Chrome/Edge**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
**Firefox**: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
**Safari**: `Cmd+Option+R`

### Solution 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 3: Restart Frontend
```bash
pkill -f vite
cd frontend
npm run dev
```

### Solution 4: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for any red errors
4. Look for network errors in the Network tab

### Solution 5: Verify API Base URL
Check that `frontend/.env` has:
```
VITE_API_URL=http://localhost:3000/api/v1
```

### Solution 6: Test with Debug Page
1. Visit http://localhost:3001/debug
2. Check if APIs return data
3. Look at browser console logs
4. Check Network tab for failed requests

## Manual API Test (Browser Console)

Open browser console and run:

```javascript
// Test fetch directly
fetch('http://localhost:3000/api/v1/cases?limit=5')
  .then(r => r.json())
  .then(d => console.log('Cases:', d))
  .catch(e => console.error('Error:', e));

fetch('http://localhost:3000/api/v1/fiches?limit=5')
  .then(r => r.json())
  .then(d => console.log('Fiches:', d))
  .catch(e => console.error('Error:', e));
```

## Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 3001
- [ ] Database has data (674 cases, 317 fiches)
- [ ] API endpoints return data when tested with curl
- [ ] Browser cache cleared
- [ ] No errors in browser console
- [ ] Debug page shows data correctly
- [ ] Network tab shows successful API calls

## If Debug Page Shows Data But Pages Don't

This indicates the API is working but the pages have an issue. Possible causes:

1. **React Component Error**: Check browser console for React errors
2. **State Management Issue**: Component state not updating
3. **Conditional Rendering Issue**: Data exists but not displayed due to conditions
4. **CSS Issue**: Data rendered but hidden by CSS

## Expected Debug Page Output

If everything is working, you should see:

```
Stats API
✅ Success!
{
  "success": true,
  "data": {
    "totalCases": 674,
    ...
  }
}

Cases API
✅ Success!
Received 5 cases
Total in database: 674
{
  "success": true,
  "data": [...],
  "pagination": {...}
}

Fiches API
✅ Success!
Received 5 fiches
Total in database: 317
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

## Still Not Working?

1. Check `frontend/frontend.log` for errors:
   ```bash
   tail -100 frontend/frontend.log
   ```

2. Check `backend/backend.log` for errors:
   ```bash
   tail -100 backend/backend.log
   ```

3. Restart everything:
   ```bash
   ./start-servers.sh
   ```

4. Test with the static HTML test page:
   Open `frontend/test-api-direct.html` in your browser

## Contact Information

If issue persists, provide:
1. Screenshot of browser console errors
2. Screenshot of debug page output
3. Output of: `curl http://localhost:3000/health`
4. Output of: `curl http://localhost:3000/api/v1/stats`

---

**Quick Test URL**: http://localhost:3001/debug
