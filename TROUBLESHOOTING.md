# Frontend Troubleshooting Guide

## Recent Fixes Applied

### API Endpoint Mismatches (Fixed)
- **Issue**: Frontend calling non-existent endpoints
- **Fixed**: Updated API client to match backend routes
- **Changes**:
  - Analytics: Now requires `businessId` parameter
  - Contacts: Now uses `/clients` endpoint (backend terminology)
  - Follow-ups: Fixed form data format and validation

### Follow-ups Form (Fixed)
- **Issue**: Form fields didn't match backend expectations
- **Fixed**: Updated form to use correct field names and data types
- **Changes**:
  - `subject` → `notes`
  - `due` → `dueDate` (with ISO string conversion)
  - `owner` → `clientId`
  - Added status display for completed/pending

### Dashboard Analytics (Fixed)
- **Issue**: Missing businessId parameter for analytics calls
- **Fixed**: Get businessId from user context and pass to API calls
- **Changes**: `getDashboardStats()` now requires `businessId` parameter

## Current API Endpoints

### Available Endpoints
- **Auth**: `/auth/login`, `/auth/register`
- **Business**: `/business`
- **Clients**: `/clients` (for contacts)
- **Follow-ups**: `/followUp`
- **Leads**: `/leads`
- **Analytics**: `/analytics/*` (requires businessId)
- **User**: `/user`

### Missing Backend Routes
These frontend pages call endpoints that don't exist in the backend:
- **Deals**: `/deals` - No backend route
- **Reports**: `/reports` - No backend route
- **AI Insights**: `/ai-insights` - No backend route
- **User Audit**: `/user/audit-log` - No backend route

## Common Issues

### 1. "API Error: 404 - Route not found"
**Cause**: Calling non-existent endpoints
**Solution**: 
- Check if endpoint exists in backend
- Use correct API methods from `apiClient`
- Update frontend to use available endpoints

### 2. "API Error: 400 - Validation error"
**Cause**: Request data doesn't match backend validation
**Solution**:
- Check form field names match backend expectations
- Ensure proper data types (dates as ISO strings)
- Validate required fields are present

### 3. "API Error: 401 - Unauthorized"
**Cause**: Missing or invalid authentication token
**Solution**:
- Check if user is logged in
- Verify token is set: `apiClient.setToken(token)`
- Check token expiration

### 4. "API Error: 500 - Internal server error"
**Cause**: Backend server error
**Solution**:
- Check backend logs for details
- Verify database connection
- Check environment variables

## Debugging Steps

1. **Check browser console** for detailed error messages
2. **Verify API calls** in Network tab
3. **Check authentication** token is set
4. **Validate form data** before submission
5. **Test with Postman** to isolate issues

## Form Validation

### Follow-ups Form
```typescript
// Required fields
{
  notes: string,        // Required, min 1 character
  dueDate: string,      // Required, ISO datetime string
  clientId: string      // Required, UUID format
}
```

### Date Format Conversion
```typescript
// Convert date input to ISO string
const formData = {
  ...form,
  dueDate: new Date(form.dueDate).toISOString()
};
```

## Authentication Flow

1. **Login/Signup**: Get token from backend
2. **Set token**: `apiClient.setToken(token)`
3. **API calls**: Token automatically included in headers
4. **Token refresh**: Handle expired tokens

## Environment Variables

Ensure these are set in `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
```

## Development Tips

1. **Use browser dev tools** to inspect API calls
2. **Check Network tab** for request/response details
3. **Use console.log** for debugging API responses
4. **Test with Postman** before implementing in frontend
5. **Check backend logs** for server-side errors 