# Customer Self-Registration Implementation

> Based on REQ-028: Customer Self-Registration — Frontend Implementation Guide

## Overview

This is a complete, production-ready implementation of the customer self-registration flow with OTP verification. It follows Angular v20+ best practices with signals, standalone components, and reactive forms.

## Architecture

### Directory Structure

```
src/app/routes/auth/self-registration/
├── self-registration.service.ts       # API endpoints (HTTP)
├── self-registration.interfaces.ts    # TypeScript interfaces
├── self-registration.graphql.ts       # GraphQL queries for lookups
├── self-registration.store.ts         # State management (signals)
├── self-registration.forms.ts         # Form field configurations
├── self-registration.component.ts     # Main component (4-step flow)
└── README.md                           # This file
```

### Routes

- **Public Access:** `/auth/self-register` - No authentication required
- **Integrated:** Uses existing auth layout and styling

## Features Implemented

### ✅ Step 1: OTP Request (Account Verification)

**Endpoint:** `POST /public/otp/request-registration`

**Payload:**
```typescript
{
  email: string;     // Required
  phone: string;     // Required (07XXXXXXXX format)
}
```

**UX Features:**
- Email and phone validation
- OTP countdown timer (10 minutes)
- "Resend Code" button with 5-minute cooldown
- Max 3 resend attempts per 30 minutes
- Error handling for all business rules

### ✅ Step 2: OTP Verification

**Endpoint:** `POST /public/otp/verify-registration`

**Payload:**
```typescript
{
  email: string;   // Required
  code: string;    // 6-digit code
}
```

**UX Features:**
- 6-digit code input field
- Attempts counter display
- Auto-lock after 5 failed attempts (30-minute cooldown)
- One-time token generation for step 3
- Clear error messages with attempt tracking

### ✅ Step 3: Registration Form (Multi-Field)

**Endpoint:** `POST /public/clients/self-register`

**Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | string | ✅ | From step 1 |
| phone | string | ✅ | From step 1 (07XXXXXXXX) |
| firstName | string | ✅ | Full name or entity name |
| lastName | string | ✅ | Last name |
| clientStreamType | enum | ✅ | Always "DOWN" (read-only) |
| categoryUids | string[] | ✅ | ≥1 customer category |
| tin | string | ⚠️ | Conditional (required for CNG, Institution, Industry, Power Plant) |
| identificationType | enum | ❌ | NATIONAL_ID / PASSPORT / DRIVING_LICENSE |
| idNumber | string | ❌ | ID number |
| subWardUid | string | ✅ | Service location (cascading dropdown) |
| regionUid | string | ✅ | Region |
| districtUid | string | ✅ | District |
| wardUid | string | ✅ | Ward |
| blockNumber | string | ❌ | House/block number |
| postalAddress | string | ❌ | Postal address |
| consent | boolean | ✅ | Must be true |
| otpToken | string | ✅ | From step 2 |

**UX Features:**
- Cascading location dropdowns (Region → District → Ward → Sub-Ward)
- Dynamic TIN field visibility based on category
- Conditional field validation
- GraphQL lookups for all dropdowns
- Organized layout with fieldsets
- Real-time form validation

### ✅ Step 4: Password Setup

**Endpoint:** `POST /public/clients/set-password`

**Payload:**
```typescript
{
  token: string;              // passwordSetupToken from step 3
  password: string;           // New password (8+ chars)
  confirmPassword: string;    // Confirmation
}
```

**Password Policy (BR-04):**
- Minimum 8 characters
- At least one uppercase (A-Z)
- At least one lowercase (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

**UX Features:**
- Client-side policy validation
- Clear policy requirements display
- Password match validation
- Error messages for each policy violation
- Application Reference display for tracking

### ✅ Step 5: Success Screen

- Application Reference display (for tracking)
- Status message ("Pending review")
- Auto-redirect to login after 3 seconds
- Manual login button option

## State Management

Uses Angular signals for reactive state:

```typescript
// SelfRegistrationStore
currentStep: computed     // Current form step (1-5)
isOtpVerified: computed   // OTP token exists
expiresInSeconds: computed // OTP expiration
attemptsLeft: computed     // Remaining OTP attempts
applicationReference: computed // Registration reference
approvalStatus: computed   // PENDING/APPROVED/REJECTED
```

## API Response Envelope

All endpoints return:

```typescript
{
  status: boolean;           // true = success, false = error
  code: number;             // Response code
  message: string;          // User-displayable message
  data?: any;               // Payload on success
  dataList?: any;           // Array payload (if applicable)
  requestId: string;        // Correlation ID
}
```

## Error Handling

### Comprehensive Error Scenarios

| Scenario | Endpoint | Error Message |
|----------|----------|---------------|
| Email blank | Step 1 | "Email is required" |
| Invalid phone | Step 1 | "Invalid phone format (07XXXXXXXX)" |
| Resend too soon | Step 1 | "Please wait before requesting another code" |
| Max requests exceeded | Step 1 | "Maximum code requests reached. Please try again later." |
| Wrong OTP code | Step 2 | "Incorrect code. 4 attempt(s) left." |
| OTP locked | Step 2 | "Too many incorrect attempts. Try again later." |
| OTP expired | Step 2 | "The code has expired or was not requested." |
| OTP token reused | Step 3 | "Please verify the code sent to your email before submitting" |
| Duplicate email | Step 3 | "A Client with the provided email already exists" |
| Duplicate phone | Step 3 | "Phone number already registered" (BR-02) |
| No category | Step 3 | "Downstreamer must have at least one customer category" |
| Bad location | Step 3 | "Village / Street does not exist" |
| Upstream attempt | Step 3 | "Upstream registration is not available on the public portal" |
| Password mismatch | Step 4 | "Passwords do not match" |
| Token expired | Step 4 | "This password setup link has expired..." |
| Invalid password | Step 4 | "Password must contain at least one uppercase letter" (etc.) |

## GraphQL Queries (Public - No Auth)

### Load Customer Categories
```graphql
query AllCustomerCategories {
  allCustomerCategories {
    uid
    name
  }
}
```

### Load Regions
```graphql
query GetAllRegions {
  getAllRegions {
    uid
    name
  }
}
```

### Cascade: Districts by Region
```graphql
query GetDistrictsByRegion($regionUid: String!) {
  getDistrictsByRegion(regionUid: $regionUid) {
    uid
    name
  }
}
```

### Cascade: Wards by District
```graphql
query GetWardsByDistrict($districtUid: String!) {
  getWardsByDistrict(districtUid: $districtUid) {
    uid
    name
  }
}
```

### Cascade: Sub-Wards by Ward
```graphql
query GetSubWardsByWard($wardUid: String!) {
  getSubWardsByWard(wardUid: $wardUid) {
    uid
    name
  }
}
```

## GraphQL Query (Authenticated - After Login)

### Track Registration Status
```graphql
query GetMyClientStatus {
  myClientStatus {
    applicationReference
    approvalStatus    # PENDING/APPROVED/REJECTED
    customerId        # Only when APPROVED
    approvalComments
    statusMessage
  }
}
```

## Integration Points

### Services Used

1. **HttpClient** - Direct HTTP calls for public endpoints
2. **Apollo (GraphQL)** - For lookup queries
3. **FetchService** - Workspace-standard service
4. **NotificationService** - Toast notifications
5. **AuthService** - For post-registration login flow

### Authorization

- **Public endpoints** (`/public/**`): No token required
- **Authenticated endpoints** (GraphQL, status): Requires `Authorization: Bearer <token>`

## User Flows

### Happy Path
1. User visits `/auth/self-register`
2. Enters email + phone → OTP sent (SMS + Email)
3. Enters 6-digit code → OTP token generated
4. Completes registration form → Application saved
5. Sets password → Account enabled
6. Sees success screen → Auto-redirects to login
7. Signs in with email + password
8. Views account status (PENDING → review → APPROVED)

### Error Recovery

**Wrong OTP Code:**
- Displays: "Incorrect code. 4 attempt(s) left."
- Can retry up to 5 times
- After 5th failure: "Too many incorrect attempts. Try again later." (30-min lock)
- User can resend OTP once lock expires

**OTP Expired:**
- If > 10 minutes pass without verification
- Error: "The code has expired or was not requested."
- User must start over (Step 1)

**Token Reuse:**
- If step 3 takes > 30 minutes after step 2
- OTP token expires
- Error: "Please verify the code..." with link back to Step 2

**Duplicate Email:**
- Backend rejects: "A Client with the provided email already exists"
- User should use login instead

**Validation Errors:**
- Form validates client-side first
- Backend is authoritative (re-validates on submit)
- All errors shown with clear messaging

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Form fields use HTML5 input types (`email`, `tel`, `password`)
- Responsive design (mobile-first)

## Security Considerations

### Frontend

- ✅ Client-side password policy enforcement (not sufficient alone)
- ✅ OTP token in memory (cleared on navigation)
- ✅ Password fields use `type="password"`
- ✅ No sensitive data logged to console
- ✅ HTTPS required in production

### Backend (enforced)

- ✅ All fields re-validated server-side
- ✅ OTP tokens single-use and time-limited (30 min)
- ✅ Password setup tokens single-use and time-limited (24 h)
- ✅ Rate limiting on OTP requests (3/30min)
- ✅ OTP attempt locking (5 attempts → 30-min lock)
- ✅ Email/phone uniqueness enforced
- ✅ Upstream (UP) registration blocked on public portal

## Future Enhancements

### Phase 2 (Not Yet Built)

- TIN verification via GovESB (currently stubbed)
- NIN (NIDA) verification
- 3-stage internal review workflow
- GSA registration integration
- Representative management

### Phase 3

- SMS OTP resend counter UI
- Email verification step
- Multi-language support
- Accessibility (WCAG AA) audit
- Load testing / performance optimization

## Testing Checklist

- [ ] Step 1: Request OTP with valid email/phone
- [ ] Step 1: Show error for invalid phone format
- [ ] Step 1: Block resend for 5 minutes
- [ ] Step 1: Block after 3 attempts in 30 minutes
- [ ] Step 2: Verify OTP with correct code
- [ ] Step 2: Show attempts remaining on wrong code
- [ ] Step 2: Lock form for 30 minutes after 5 failures
- [ ] Step 3: Load categories from GraphQL
- [ ] Step 3: Cascade regions → districts → wards → subwards
- [ ] Step 3: Show TIN field only for non-household categories
- [ ] Step 3: Block submission without categories
- [ ] Step 3: Show error for duplicate email
- [ ] Step 4: Enforce password policy (8 chars, upper, lower, number, special)
- [ ] Step 4: Show error for mismatched passwords
- [ ] Step 5: Display application reference
- [ ] Step 5: Auto-redirect to login after 3 seconds
- [ ] All steps: Show proper error messages from backend
- [ ] All steps: Navigation between steps works correctly
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Accessibility: Form labels, ARIA, keyboard navigation

## Known Limitations

1. **TIN Verification:** Currently stubbed by backend (returns PENDING until GovESB integration)
2. **OTP Storage:** Uses Redis if available, falls back to in-process memory (no frontend impact)
3. **Email Verification:** No separate email verification step (OTP serves this purpose)
4. **SMS Gateway:** Configured server-side; frontend has no control

## Support & Troubleshooting

### OTP Not Received

1. Check spam folder
2. Verify phone number format (07XXXXXXXX)
3. Try resending after 5-minute cooldown
4. Contact support if persists

### Password Setup Link Expired

- Link is valid for 24 hours
- If expired: User must log in and request new registration
- Backend response: "This password setup link has expired..."

### Can't Proceed After OTP Verification

- Check browser console for errors
- Verify OTP token was saved (should be automatic)
- Clear browser cache and try again

### Cascading Dropdowns Not Loading

- Check network tab for GraphQL errors
- Verify GraphQL endpoint is accessible
- Check Apollo cache configuration

## Files Overview

### Service Layer
- `self-registration.service.ts` - HTTP endpoints for public API calls

### State & Data
- `self-registration.store.ts` - Signals-based state management
- `self-registration.interfaces.ts` - TypeScript type definitions
- `self-registration.graphql.ts` - GraphQL query definitions

### UI
- `self-registration.component.ts` - Main component (4 steps + success)
- `self-registration.forms.ts` - Form field configurations

### Routing
- Updated `auth.routes.ts` - Added `/auth/self-register` route

## Code Examples

### Using the Service

```typescript
import { SelfRegistrationService } from './self-registration.service';

constructor(private srService: SelfRegistrationService) {}

requestOtp() {
  this.srService.requestRegistrationOtp({
    email: 'customer@example.com',
    phone: '0712345678'
  }).subscribe(res => {
    if (res.status) {
      // OTP sent successfully
      console.log('Expires in:', res.data.expiresInSeconds);
    } else {
      console.error(res.message);
    }
  });
}
```

### Using the Store

```typescript
import { SelfRegistrationStore } from './self-registration.store';

constructor(private store: SelfRegistrationStore) {}

get currentStep() {
  return this.store.currentStep; // Computed signal
}

saveStep1(data: SelfRegistrationStep1) {
  this.store.setStep1(data);
}
```

## License

Internal use only - GASCO distribution system.
