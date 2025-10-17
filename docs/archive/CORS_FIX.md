# CORS Fix for Authentication

**Date**: 2025-10-15
**Issue**: "Access to fetch has been blocked by CORS policy"

## Problem

When trying to register/login, the browser console showed:
```
Access to fetch at 'http://localhost:3000/api/v1/auth/register' from origin 'http://localhost:3002'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

The backend CORS configuration only allowed requests from port **3001**:
```javascript
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    // ...
}));
```

But the frontend is running on port **3002** (Vite chose 3002 because 3001 was already in use).

## Solution

Updated `/Users/damienfulliquet/Documents/GitHub/ecos-grid-generator/backend/server-simple.js` line 48:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3002',  // Added
        'http://127.0.0.1:3002'   // Added
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## How to Verify

1. Backend must be restarted after this change
2. Check health endpoint: `curl http://localhost:3000/health`
3. Try registering from http://localhost:3002
4. Should work without CORS errors

## About Chrome Extension Errors

The console also showed many errors like:
```
chrome-extension://pejdijmoenmkgeppbflobdenhhabjlaj/utils.js net::ERR_FILE_NOT_FOUND
```

**These are harmless** - they're from a Chrome extension trying to inject scripts. They don't affect the application and can be ignored.

---

**Status**: ✅ CORS fixed, backend restarted
**Backend**: http://localhost:3000
**Frontend**: http://localhost:3002
