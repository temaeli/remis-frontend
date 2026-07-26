# Self-Registration Implementation - Quick Reference

## 📦 Files Created

```
src/app/routes/auth/self-registration/
├── self-registration.service.ts          # HTTP service for public endpoints
├── self-registration.interfaces.ts       # TypeScript interfaces & types
├── self-registration.graphql.ts          # GraphQL query definitions
├── self-registration.store.ts            # Signals-based state management
├── self-registration.forms.ts            # Form field configurations
├── self-registration.component.ts        # Main 4-step component
├── examples.component.ts                 # Usage examples
└── README.md                             # Detailed documentation
```

## 📝 Files Modified

```
src/app/routes/auth/
└── auth.routes.ts                       # Added self-register route
```

## 🚀 How to Access

**URL:** `http://localhost:4200/auth/self-register`

**From login page:** Add link to self-registration:
```html
<p>Don't have an account? 
  <a routerLink="/auth/self-register">Register here</a>
</p>
```

## 📋 Implementation Summary

### The 4-Step Flow

```
┌─────────────────────────────────────────┐
│ Step 1: OTP Request                     │
│ Email + Phone → Code sent (SMS + Email) │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Step 2: OTP Verification                │
│ Enter 6-digit code → Get OTP Token      │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Step 3: Registration Form               │
│ Name, Location, Category → Get Token    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Step 4: Password Setup                  │
│ Password (8+ chars, complex) → Success  │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Step 5: Success Screen                  │
│ Application Reference + Auto-Redirect   │
└─────────────────────────────────────────┘
```

### Key Components

| Component | Purpose | Lines |
|-----------|---------|-------|
| Service | HTTP calls to `/public/**` endpoints | 100+ |
| Store | Signals-based state (steps, tokens) | 120+ |
| Component | Main 4-step form with Material UI | 650+ |
| GraphQL | Lookup queries for dropdowns | 80+ |
| Interfaces | Type definitions for all steps | 110+ |

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/public/otp/request-registration` | Request OTP |
| POST | `/public/otp/verify-registration` | Verify OTP code |
| POST | `/public/clients/self-register` | Submit registration |
| POST | `/public/clients/set-password` | Set account password |

### Lookup Queries (GraphQL)

| Query | Purpose |
|-------|---------|
| `allCustomerCategories` | Dropdown options |
| `getAllRegions` | Location cascade - regions |
| `getDistrictsByRegion` | Location cascade - districts |
| `getWardsByDistrict` | Location cascade - wards |
| `getSubWardsByWard` | Location cascade - sub-wards |
| `myClientStatus` | Track registration (authenticated) |

## 🎨 UI Features

- **Material Design** - Modern look & feel
- **Responsive** - Works on mobile, tablet, desktop
- **Progress Indication** - Step labels, countdown timers
- **Error Handling** - Clear error messages with recovery flows
- **Accessibility** - Form labels, ARIA attributes, keyboard navigation
- **Loading States** - Submit buttons show loading spinners

## 🔒 Security Features

- ✅ Client-side password policy enforcement
- ✅ OTP token single-use & time-limited
- ✅ Password setup token time-limited (24h)
- ✅ Rate limiting enforcement (resend cooldown, max attempts)
- ✅ Form field validation (email, phone, required fields)
- ✅ Backend re-validation (authoritative)

## 📊 Response Format

All endpoints return:
```json
{
  "status": true,
  "code": 9000,
  "message": "Success message",
  "data": { /* payload */ },
  "dataList": null,
  "requestId": "correlation-id"
}
```

## 🛠️ Integration Steps

1. **Backend Setup**
   - Ensure `/public/**` endpoints are configured
   - Configure GraphQL queries for lookups
   - Set OTP timings (10min expire, 5min resend, 30min lock)

2. **Frontend Configuration**
   - Update `environment.ts` with API base URL if needed
   - Ensure Apollo GraphQL client is configured
   - Add link to self-registration from login page

3. **Testing**
   - Navigate to `/auth/self-register`
   - Complete all 4 steps
   - Verify database records created
   - Test error scenarios

## 📚 Documentation

See `README.md` in this directory for:
- Detailed endpoint specifications
- Complete error scenario list
- Field validation rules
- UX guidelines
- Testing checklist
- Troubleshooting guide

## 🔗 Related Files

- **Auth Layout:** `src/app/routes/auth/auth-layout.ts`
- **Auth Service:** `src/app/routes/auth/auth.service.ts`
- **Login Component:** `src/app/routes/auth/login/login.component.ts`
- **Settings:** `src/app/routes/settings/regions/`

## 🚨 Important Notes

1. **OTP Token Lifetime:** 30 minutes (once verified)
2. **Password Setup Token:** 24 hours (from registration)
3. **Stream Type:** Always "DOWN" (hardcoded, read-only)
4. **TIN Field:** Visible only for non-household categories
5. **Location Cascade:** Region → District → Ward → Sub-Ward

## 🔄 State Flow

```typescript
// Store manages entire flow state
SelfRegistrationStore {
  currentStep,              // 1-5 (computed from step data)
  isOtpVerified,           // Has OTP token?
  expiresInSeconds,        // OTP countdown
  attemptsLeft,            // OTP verification attempts
  applicationReference,    // From step 3 response
  approvalStatus,          // PENDING/APPROVED/REJECTED
  passwordSetupToken,      // From step 3 response
}
```

## 💡 Usage Examples

See `examples.component.ts` for:
- Using the service directly
- Accessing store signals
- Complete flow implementation
- Error handling
- Password validation
- Status tracking (after login)
- Navigation

## ✅ Ready for

- ✅ Backend integration
- ✅ End-to-end testing
- ✅ Accessibility audit (WCAG AA)
- ✅ Performance testing
- ✅ Mobile device testing
- ✅ Deployment

---

**Created:** July 1, 2026
**Status:** Complete & Ready for Backend Integration
**Lines of Code:** ~1700+
