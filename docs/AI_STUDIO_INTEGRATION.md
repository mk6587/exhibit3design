# AI Studio Integration Guide (NEW Reservation System)

## 🎉 NEW: Token Reservation System

**Status**: ✅ Active (as of 2025)  
**Old System**: ❌ Deprecated - The old synchronous `increment-ai-tokens` approach is no longer recommended

The new reservation-based system provides:
- **Atomic token management** - Reserve before, commit on success, rollback on failure
- **Race condition prevention** - Tokens are reserved upfront
- **Better reliability** - Automatic cleanup of expired reservations
- **Audit trail** - Complete transaction logging

---

## Architecture Overview

```
┌─────────────┐                    ┌──────────────────┐
│             │  1. Reserve tokens │                  │
│  AI Studio  ├───────────────────►│  exhibit3design  │
│             │◄───────────────────┤  (Supabase)      │
│             │  2. Reservation ID │                  │
└──────┬──────┘                    └──────────────────┘
       │
       │ 3. Generate content
       │    (AI Service)
       │
       ▼
┌─────────────┐
│ Success? ───┼───► 4a. Commit reservation
│             │
│ Failure? ───┼───► 4b. Rollback reservation
└─────────────┘
```

---

## Required APIs from exhibit3design

### 1. POST `/reserve-tokens`

Reserve tokens before AI generation starts.

**Endpoint**: `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/reserve-tokens`

**Request**:
```typescript
{
  serviceType: 'image_edit' | 'image_generation' | 'image_inpaint' | 'text_to_video' | 'image_to_video',
  tokensAmount: number
}
```

**Response (Success - 200)**:
```typescript
{
  reservationId: string,  // UUID for this reservation
  newBalance: number      // User's available balance after reservation
}
```

**Response (Insufficient tokens - 403)**:
```typescript
{
  error: "Insufficient tokens",
  availableBalance: number,
  required: number
}
```

**Example**:
```typescript
const response = await fetch(
  'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/reserve-tokens',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serviceType: 'image_edit',
      tokensAmount: 1
    })
  }
);

const { reservationId, newBalance } = await response.json();
```

---

### 2. POST `/commit-reservation`

Commit a reservation after successful AI generation.

**Endpoint**: `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/commit-reservation`

**Request**:
```typescript
{
  reservationId: string,
  aiResultUrl: string  // URL of generated content
}
```

**Response (Success - 200)**:
```typescript
{
  success: true,
  newBalance: number  // Final balance after commit
}
```

**Response (Failure - 404)**:
```typescript
{
  error: "Reservation not found or already processed"
}
```

**Example**:
```typescript
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
      aiResultUrl: 'https://storage.example.com/result.jpg'
    })
  }
);
```

---

### 3. POST `/rollback-reservation`

Rollback a reservation when AI generation fails.

**Endpoint**: `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/rollback-reservation`

**Request**:
```typescript
{
  reservationId: string,
  reason: string  // Why it failed (for logging)
}
```

**Response (Success - 200)**:
```typescript
{
  success: true,
  newBalance: number  // Balance after refund
}
```

**Example**:
```typescript
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
      reason: 'AI service timeout'
    })
  }
);
```

---

### 4. GET `/get-user-balance`

Get user's current available balance and subscription info.

**Endpoint**: `https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/get-user-balance`

**Response (Success - 200)**:
```typescript
{
  balance: number,              // Available balance (excluding reserved)
  totalBalance: number,         // Total tokens
  reservedTokens: number,       // Currently reserved tokens
  subscriptionPlan: string,     // e.g. "Premium", "Basic", "Free"
  isPremium: boolean
}
```

**Example**:
```typescript
const response = await fetch(
  'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/get-user-balance',
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  }
);

const { balance, subscriptionPlan } = await response.json();
```

---

## Complete Integration Flow

### React/TypeScript Example

```typescript
import { useState } from 'react';

interface ReservationState {
  reservationId: string | null;
  isGenerating: boolean;
  error: string | null;
}

function AIGenerationComponent() {
  const [state, setState] = useState<ReservationState>({
    reservationId: null,
    isGenerating: false,
    error: null
  });

  const generateContent = async (serviceType: string, jwtToken: string) => {
    let reservationId: string | null = null;

    try {
      setState({ ...state, isGenerating: true, error: null });

      // 1. Reserve tokens
      const reserveResponse = await fetch(
        'https://fipebdkvzdrljwwxccrj.supabase.co/functions/v1/reserve-tokens',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serviceType: serviceType,
            tokensAmount: 1
          })
        }
      );

      if (!reserveResponse.ok) {
        const error = await reserveResponse.json();
        throw new Error(error.error || 'Failed to reserve tokens');
      }

      const { reservationId: resId, newBalance } = await reserveResponse.json();
      reservationId = resId;

      console.log(`Reserved! Balance: ${newBalance}`);

      // 2. Call AI service
      const aiResult = await callYourAIService(/* parameters */);

      // 3. Commit on success
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
            aiResultUrl: aiResult.url
          })
        }
      );

      console.log('Success! Token committed');
      setState({ reservationId: null, isGenerating: false, error: null });

    } catch (error) {
      console.error('Generation failed:', error);

      // 4. Rollback on failure
      if (reservationId) {
        try {
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
                reason: error.message || 'Unknown error'
              })
            }
          );
          console.log('Tokens refunded');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }

      setState({
        reservationId: null,
        isGenerating: false,
        error: error.message
      });
    }
  };

  return (
    // Your UI here
    <button onClick={() => generateContent('image_edit', yourJWT)}>
      Generate
    </button>
  );
}
```

---

## Data Flow Examples

### ✅ Successful Operation

```
1. User clicks "Edit Image"
2. AI Studio → reserve-tokens (1 token)
3. exhibit3design: Creates reservation, reserves token
4. exhibit3design → AI Studio: { reservationId: "abc-123", newBalance: 4 }
5. AI Studio: Calls Lovable AI, generates image
6. AI Studio → commit-reservation
7. exhibit3design: Deducts token, marks as committed
8. exhibit3design → AI Studio: { success: true, newBalance: 4 }
```

### ❌ Failed Operation

```
1. User clicks "Edit Image"
2. AI Studio → reserve-tokens (1 token)
3. exhibit3design → AI Studio: { reservationId: "xyz-789", newBalance: 4 }
4. AI Studio: AI service fails (timeout/error)
5. AI Studio → rollback-reservation
6. exhibit3design: Refunds token, marks as rolled_back
7. exhibit3design → AI Studio: { success: true, newBalance: 5 }
```

### ⏰ Expired Reservation

```
1. Reservation created but not committed/rolled back within 10 minutes
2. Automatic cleanup runs (via cleanup_expired_reservations)
3. Token automatically refunded to user
4. Reservation marked as 'rolled_back' with reason 'Reservation expired'
```

---

## Authentication

All endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

The JWT must be generated using the `/generate-ai-token` endpoint from exhibit3design and contain:
- `userId`: UUID of the user
- `email`: User's email address
- Expiration time (1 hour)

---

## Database Schema (exhibit3design)

The following tables support the reservation system:

### `token_reservations`
```sql
- id: UUID (primary key)
- user_id: UUID
- service_type: TEXT
- tokens_amount: INTEGER
- status: TEXT ('reserved', 'committed', 'rolled_back')
- ai_result_url: TEXT (nullable)
- failure_reason: TEXT (nullable)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ (10 minutes from creation)
```

### `token_transactions`
```sql
- id: UUID (primary key)
- user_id: UUID
- reservation_id: UUID (foreign key)
- transaction_type: TEXT ('reserve', 'commit', 'rollback')
- tokens_amount: INTEGER
- balance_after: INTEGER
- created_at: TIMESTAMPTZ
```

### `profiles` (updated)
```sql
- ai_tokens_balance: INTEGER (total tokens)
- reserved_tokens: INTEGER (currently reserved)
- Available balance = ai_tokens_balance - reserved_tokens
```

---

## Error Handling

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 401 | Invalid token | JWT expired or invalid | Refresh JWT token |
| 403 | Insufficient tokens | Not enough available tokens | Ask user to purchase more |
| 404 | Reservation not found | Invalid ID or already processed | Don't retry, start new reservation |
| 500 | Internal server error | Database or server issue | Retry with exponential backoff |

---

## Automatic Cleanup

Reservations expire after **10 minutes**. The system automatically:
1. Refunds tokens to user's balance
2. Marks reservation as 'rolled_back'
3. Logs reason as 'Reservation expired'

This prevents tokens being locked forever if AI Studio crashes or loses connection.

---

## Migration from Old System

### ❌ OLD (Deprecated):
```typescript
// DON'T USE THIS ANYMORE
await fetch('.../increment-ai-tokens', {
  method: 'POST',
  body: JSON.stringify({ prompt, serviceType })
});
```

### ✅ NEW (Recommended):
```typescript
// 1. Reserve first
const { reservationId } = await fetch('.../reserve-tokens', { ... });

// 2. Generate
const result = await generateAI();

// 3a. Commit on success
await fetch('.../commit-reservation', { reservationId, aiResultUrl });

// OR 3b. Rollback on failure
await fetch('.../rollback-reservation', { reservationId, reason });
```

---

## Troubleshooting

### Issue: 403 Insufficient tokens
- Check available balance with `/get-user-balance`
- Remember: `available = total - reserved`
- User might have pending reservations

### Issue: 404 Reservation not found
- Reservation might have expired (>10 minutes)
- Reservation might already be committed/rolled back
- Start a new reservation

### Issue: Tokens not refunded
- Check if rollback was called successfully
- Check logs: https://supabase.com/dashboard/project/fipebdkvzdrljwwxccrj/functions/rollback-reservation/logs
- Expired reservations are automatically cleaned up

---

## Logs & Monitoring

View logs for each endpoint:
- Reserve: https://supabase.com/dashboard/project/fipebdkvzdrljwwxccrj/functions/reserve-tokens/logs
- Commit: https://supabase.com/dashboard/project/fipebdkvzdrljwwxccrj/functions/commit-reservation/logs
- Rollback: https://supabase.com/dashboard/project/fipebdkvzdrljwwxccrj/functions/rollback-reservation/logs
- Balance: https://supabase.com/dashboard/project/fipebdkvzdrljwwxccrj/functions/get-user-balance/logs

---

## Best Practices

1. **Always reserve before generating** - Never start AI generation without a reservation
2. **Always commit or rollback** - Don't leave reservations hanging
3. **Handle errors gracefully** - Always rollback on error
4. **Check balance first** - Call `/get-user-balance` before showing generation UI
5. **Set timeouts** - If your AI service takes >5 minutes, increase reservation expiry
6. **Log everything** - Keep track of reservationIds for debugging

---

## Support

For issues or questions:
- Check edge function logs in Supabase dashboard
- Review `token_transactions` table for audit trail
- Contact exhibit3design team with reservationId for investigation
