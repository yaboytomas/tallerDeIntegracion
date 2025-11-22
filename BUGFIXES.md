# Bug Fixes - JSP Detailing

## Fix Applied: Cannot set property query error

### Issue
**Error Message:** `Cannot set property query of #<IncomingMessage> which has only a getter`

**When:** When creating an account (registro/register endpoint)

**Root Cause:** The `sanitizeInput` middleware in `backend/src/middleware/security.ts` was trying to reassign read-only properties (`req.query`, `req.params`) directly, which is not allowed in Express.js.

### Solution Applied

**File:** `backend/src/middleware/security.ts`

**Before (Problematic code):**
```typescript
if (req.query) {
  req.query = sanitize(req.query);  // ❌ Cannot reassign read-only property
}
if (req.params) {
  req.params = sanitize(req.params);  // ❌ Cannot reassign read-only property
}
```

**After (Fixed code):**
```typescript
// Sanitize body in place (body is writable)
if (req.body && typeof req.body === 'object') {
  Object.keys(req.body).forEach(key => {
    req.body[key] = sanitize(req.body[key]);
  });
}

// Sanitize query in place (query is read-only, so we modify its properties)
if (req.query && typeof req.query === 'object') {
  Object.keys(req.query).forEach(key => {
    const sanitized = sanitize(req.query[key]);
    // Use Object.defineProperty to safely update
    Object.defineProperty(req.query, key, {
      value: sanitized,
      writable: true,
      enumerable: true,
      configurable: true
    });
  });
}

// Sanitize params in place (params is read-only, so we modify its properties)
if (req.params && typeof req.params === 'object') {
  Object.keys(req.params).forEach(key => {
    const sanitized = sanitize(req.params[key]);
    // Use Object.defineProperty to safely update
    Object.defineProperty(req.params, key, {
      value: sanitized,
      writable: true,
      enumerable: true,
      configurable: true
    });
  });
}
```

### Why This Works

1. **`req.body` is writable**: We can modify its properties directly
2. **`req.query` and `req.params` are read-only**: We cannot reassign them, but we can modify their individual properties using `Object.defineProperty()`
3. **In-place modification**: Instead of creating a new object, we modify the existing properties

### Impact

- ✅ **Register endpoint** now works correctly
- ✅ **All endpoints with query parameters** now work correctly
- ✅ **All endpoints with URL parameters** now work correctly
- ✅ **Security sanitization** still functions as intended
- ✅ **No breaking changes** to the API

### Testing

**Build Status:**
```bash
✅ Backend TypeScript compilation: SUCCESS
✅ Frontend TypeScript compilation: SUCCESS
✅ No linting errors
```

**Verified Endpoints:**
- ✅ POST `/api/auth/register` - Registration works
- ✅ POST `/api/auth/login` - Login works
- ✅ GET `/api/products?category=...` - Query params work
- ✅ GET `/api/products/:id` - URL params work

### Additional Checks Performed

Scanned the entire codebase for similar patterns:
```bash
✅ No other instances of direct query/params reassignment found
✅ All middleware follows Express.js best practices
```

---

## Status: ✅ RESOLVED

The bug has been fixed and tested. The registration process now works correctly without errors.

**Date Fixed:** 22 de Noviembre, 2025  
**Verified By:** Complete system test  
**Build Status:** All green ✅

