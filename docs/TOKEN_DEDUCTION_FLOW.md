# Token Deduction System - Complete Documentation

## Overview
This document describes the complete token deduction mechanism for AI generations across exhibit3design.com and ai.exhibit3design.com.

## System Architecture

### Main Site (exhibit3design.com)
- Handles user authentication
- Generates JWT tokens for AI Studio
- Displays token balance
- Provides edge functions for token management

### AI Studio (ai.exhibit3design.com)
- Performs AI image generation
- **MUST** call token deduction endpoints
- **MUST** handle reservation lifecycle

---

## Token Deduction Flow (REQUIRED)

### Method 1: Reserve-Commit Pattern (RECOMMENDED)

This is the **CORRECT** and **ATOMIC** way to handle tokens:

```typescript
// STEP 1: Before starting AI generation
const reserveResponse = await fetch(
  'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/reserve-tokens',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serviceType: 'image_edit', // or 'rotate_360', 'remove_background', etc.
      tokensAmount: 1
    })
  }
);

const { reservationId, newBalance } = await reserveResponse.json();

// STEP 2: Perform AI generation
try {
  const aiResult = await performAIGeneration();
  
  // STEP 3a: If successful, commit the reservation
  await fetch(
    'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/commit-reservation',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reservationId: reservationId,
        aiResultUrl: aiResult.outputUrl
      })
    }
  );
  
} catch (error) {
  // STEP 3b: If failed, rollback the reservation
  await fetch(
    'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/rollback-reservation',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reservationId: reservationId,
        reason: error.message || 'Generation failed'
      })
    }
  );
  
  throw error;
}
```

### Method 2: Direct Deduction (LEGACY)

Only use this if reserve-commit is not feasible:

```typescript
// After successful AI generation
await fetch(
  'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/increment-ai-tokens',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'User prompt text',
      serviceType: 'image_edit',
      inputImageUrl: inputUrl,
      outputImageUrl: outputUrl
    })
  }
);
```

---

## Database Functions

### 1. `reserve_tokens_atomic`
**Purpose:** Atomically reserve tokens before generation

**Parameters:**
- `p_user_id` (uuid): User ID
- `p_service_type` (text): Service type (e.g., 'image_edit')
- `p_tokens_amount` (integer): Number of tokens to reserve

**Returns:**
```json
{
  "success": true,
  "reservationId": "uuid",
  "newBalance": 1
}
```

**Behavior:**
1. Cleans up expired reservations
2. Checks available balance (total - reserved)
3. Creates reservation record with 10-minute expiry
4. Increments `reserved_tokens` field
5. Logs transaction

### 2. `commit_reservation_atomic`
**Purpose:** Commit reservation and deduct tokens after successful generation

**Parameters:**
- `p_reservation_id` (uuid): Reservation ID from reserve call
- `p_user_id` (uuid): User ID
- `p_ai_result_url` (text): URL of generated result

**Returns:**
```json
{
  "success": true,
  "newBalance": 0
}
```

**Behavior:**
1. Validates reservation exists and is in 'reserved' state
2. Updates reservation status to 'committed'
3. Deducts from `ai_tokens_balance`
4. Increments `ai_tokens_used`
5. Decrements `reserved_tokens`
6. Creates record in `ai_generation_history`
7. Logs transaction

### 3. `rollback_reservation_atomic`
**Purpose:** Rollback reservation if generation fails

**Parameters:**
- `p_reservation_id` (uuid): Reservation ID
- `p_user_id` (uuid): User ID
- `p_reason` (text): Reason for rollback

**Returns:**
```json
{
  "success": true,
  "newBalance": 1
}
```

**Behavior:**
1. Validates reservation exists
2. Updates reservation status to 'rolled_back'
3. Decrements `reserved_tokens` (refunds)
4. Logs transaction

### 4. `deduct_tokens_atomic`
**Purpose:** Direct token deduction (legacy method)

**Parameters:**
- `p_user_id` (uuid): User ID
- `p_token_type` (text): 'ai_tokens' or 'video_results'
- `p_amount` (integer): Amount to deduct
- `p_source` (text): Source of deduction
- `p_metadata` (jsonb): Optional metadata

**Returns:**
```json
{
  "success": true,
  "balance": 0
}
```

---

## Database Tables

### `profiles`
Stores user token balances:
- `ai_tokens_balance`: Current available tokens
- `ai_tokens_used`: Total tokens used (lifetime)
- `ai_tokens_limit`: Maximum tokens user has had
- `reserved_tokens`: Currently reserved tokens (pending generations)
- `video_results_balance`: Video generation balance
- `video_results_used`: Total video results used

### `token_reservations`
Tracks active reservations:
- `id`: Reservation ID
- `user_id`: User ID
- `service_type`: Type of AI service
- `tokens_amount`: Number of tokens reserved
- `status`: 'reserved', 'committed', or 'rolled_back'
- `expires_at`: Expiry time (10 minutes from creation)
- `ai_result_url`: URL of generated result (after commit)
- `failure_reason`: Reason for rollback (if applicable)

### `ai_generation_history`
Records all successful generations:
- `user_id`: User ID
- `service_type`: Type of service
- `prompt`: User prompt
- `input_image_url`: Input image URL
- `output_image_url`: Output image URL
- `tokens_used`: Number of tokens used
- `is_public_sample`: Whether it's a public sample

### `token_audit_log`
Complete audit trail:
- `user_id`: User ID
- `action`: 'grant', 'deduct', 'correction'
- `token_type`: 'ai_tokens' or 'video_results'
- `amount`: Amount changed
- `balance_before`: Balance before change
- `balance_after`: Balance after change
- `source`: Source of change
- `metadata`: Additional metadata

### `token_transactions`
Transaction history for reservations:
- `user_id`: User ID
- `reservation_id`: Related reservation
- `transaction_type`: 'reserve', 'commit', 'rollback'
- `tokens_amount`: Amount involved
- `balance_after`: Balance after transaction

---

## Error Handling

### Insufficient Balance
```json
{
  "error": "Insufficient tokens",
  "status": 403,
  "availableBalance": 0,
  "required": 1
}
```

### Expired/Invalid Reservation
```json
{
  "error": "Reservation not found or already processed",
  "status": 404
}
```

### Invalid JWT
```json
{
  "error": "Invalid token",
  "status": 401
}
```

---

## Monitoring & Debugging

### Check User Balance
```sql
SELECT 
  user_id,
  ai_tokens_balance,
  ai_tokens_used,
  reserved_tokens,
  ai_tokens_balance - reserved_tokens as available_balance
FROM profiles
WHERE user_id = 'user-uuid';
```

### Check Active Reservations
```sql
SELECT * FROM token_reservations
WHERE user_id = 'user-uuid'
  AND status = 'reserved'
  AND expires_at > now();
```

### Check Generation History
```sql
SELECT * FROM ai_generation_history
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 10;
```

### Check Audit Log
```sql
SELECT * FROM token_audit_log
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 20;
```

### Find Orphaned Generations (NO TOKEN DEDUCTION)
```sql
-- Generations that exist but have no corresponding token deduction
SELECT 
  h.user_id,
  h.created_at,
  h.service_type,
  h.output_image_url,
  p.ai_tokens_balance
FROM ai_generation_history h
JOIN profiles p ON h.user_id = p.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM token_audit_log tal
  WHERE tal.user_id = h.user_id
    AND tal.action = 'deduct'
    AND tal.created_at >= h.created_at - interval '1 minute'
    AND tal.created_at <= h.created_at + interval '1 minute'
)
ORDER BY h.created_at DESC;
```

---

## Current Issue (As of 2025-11-02)

**Problem:** AI Studio is NOT calling any token deduction endpoints.

**Evidence:**
1. User `mohammadk.digikala@gmail.com` has generation history
2. User shows 2/2 tokens (no deduction occurred)
3. No entries in `token_audit_log` for deductions
4. No entries in `token_reservations` for this user

**Impact:**
- Users can generate unlimited AI results without token deduction
- Token balance is meaningless
- Subscription benefits are not enforced

**Required Fix:**
AI Studio (ai.exhibit3design.com) MUST implement the Reserve-Commit pattern or Direct Deduction method described above.

---

## Testing Checklist

### Before Deploying AI Studio Changes:

- [ ] Reserve tokens before generation starts
- [ ] Commit reservation after successful generation
- [ ] Rollback reservation after failed generation
- [ ] Handle network errors during reservation calls
- [ ] Test with 0 balance (should prevent generation)
- [ ] Test with expired reservations (should cleanup automatically)
- [ ] Verify audit log entries are created
- [ ] Verify generation history is created
- [ ] Test concurrent generations (multiple tabs)
- [ ] Test interrupted generations (browser closed mid-generation)

---

## Client-Side Integration Example (AI Studio)

```typescript
// File: services/tokenService.ts (AI STUDIO CODEBASE)

interface ReservationResult {
  reservationId: string;
  newBalance: number;
}

interface TokenService {
  reserve(serviceType: string, tokensAmount: number): Promise<ReservationResult>;
  commit(reservationId: string, aiResultUrl: string): Promise<void>;
  rollback(reservationId: string, reason: string): Promise<void>;
}

export class TokenServiceImpl implements TokenService {
  private readonly BASE_URL = 'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1';
  private jwtToken: string;

  constructor(jwtToken: string) {
    this.jwtToken = jwtToken;
  }

  async reserve(serviceType: string, tokensAmount: number): Promise<ReservationResult> {
    const response = await fetch(`${this.BASE_URL}/reserve-tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ serviceType, tokensAmount })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reserve tokens');
    }

    return response.json();
  }

  async commit(reservationId: string, aiResultUrl: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/commit-reservation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reservationId, aiResultUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to commit reservation');
    }
  }

  async rollback(reservationId: string, reason: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/rollback-reservation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reservationId, reason })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to rollback reservation');
    }
  }
}

// Usage in AI generation flow:
export async function performAIGenerationWithTokens(
  jwtToken: string,
  serviceType: string,
  generationFn: () => Promise<{ outputUrl: string }>
) {
  const tokenService = new TokenServiceImpl(jwtToken);
  
  // Step 1: Reserve tokens
  const { reservationId, newBalance } = await tokenService.reserve(serviceType, 1);
  console.log(`Tokens reserved. New balance: ${newBalance}`);
  
  try {
    // Step 2: Perform generation
    const result = await generationFn();
    
    // Step 3a: Commit on success
    await tokenService.commit(reservationId, result.outputUrl);
    console.log('Token deduction committed successfully');
    
    return result;
  } catch (error) {
    // Step 3b: Rollback on failure
    await tokenService.rollback(reservationId, error.message || 'Generation failed');
    console.log('Token reservation rolled back');
    
    throw error;
  }
}
```

---

## Conclusion

The token system is **correctly implemented** in the backend (exhibit3design.com), but **NOT INTEGRATED** in the AI Studio frontend (ai.exhibit3design.com).

**Action Required:** Update AI Studio to call the token reservation endpoints as documented above.
