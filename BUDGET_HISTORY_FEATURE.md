# Budget History Transaction Tracking Feature

## Overview
This feature implements individual transaction history tracking for ads budget management. Each budget addition and spend update is recorded as a separate entry in the history, rather than just storing cumulative totals.

## Architecture

### Database Schema Changes
Added two JSON fields to the `AdsBudget` table to store transaction history:

```prisma
model AdsBudget {
  ...
  budgetHistory Json     @default("[]") // Array of budget transaction entries
  spentHistory  Json     @default("[]") // Array of spend transaction entries
  ...
}

model AdsBudgetHistory {
  id            Int      @id @default(autoincrement())
  adsBudgetId   Int
  type          String   // "budget" atau "spend"
  amount        Float
  note          String?
  createdBy     String?
  createdAt     DateTime @default(now())
}
```

### History Entry Structure
Each history entry contains:
- `id`: Unique timestamp-based identifier
- `type`: "budget" (penambahan budget) or "spend" (penambahan spend)
- `amount`: The transaction amount (either increase or adjustment)
- `note`: Description of the transaction
- `createdBy`: User who recorded the transaction
- `createdAt`: ISO 8601 formatted timestamp

Example:
```json
{
  "id": 1729350240123,
  "type": "budget",
  "amount": 5000000,
  "note": "Initial budget created",
  "createdBy": "Admin",
  "createdAt": "2025-10-18T10:30:40.123Z"
}
```

## API Endpoints

### GET /api/ads-budget-history
Retrieve transaction history for a specific budget.

**Query Parameters:**
- `adsBudgetId` (required): Budget ID
- `type` (optional): Filter by type - "budget", "spend", or omit for all

**Example:**
```bash
# Get all transactions
curl "http://localhost:3000/api/ads-budget-history?adsBudgetId=1"

# Get only budget additions
curl "http://localhost:3000/api/ads-budget-history?adsBudgetId=1&type=budget"

# Get only spend updates
curl "http://localhost:3000/api/ads-budget-history?adsBudgetId=1&type=spend"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1729350240124,
      "type": "spend",
      "amount": 1500000,
      "note": "Spend adjustment from 0 to 1500000",
      "createdBy": "Admin",
      "createdAt": "2025-10-18T10:35:20.456Z"
    },
    {
      "id": 1729350240123,
      "type": "budget",
      "amount": 2500000,
      "note": "Budget adjustment from 5000000 to 7500000",
      "createdBy": "Admin",
      "createdAt": "2025-10-18T10:30:40.123Z"
    }
  ]
}
```

### POST /api/ads-budget-history
Manually record a transaction (typically called by ads-budget API after POST/PUT).

**Request Body:**
```json
{
  "adsBudgetId": 1,
  "type": "budget",
  "amount": 500000,
  "note": "Additional budget allocation",
  "createdBy": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1729350240125,
    "type": "budget",
    "amount": 500000,
    "note": "Additional budget allocation",
    "createdBy": "Admin",
    "createdAt": "2025-10-18T10:45:00.789Z"
  }
}
```

## Budget API Changes

### POST /api/ads-budget
When creating or updating a budget, the system now automatically records transactions:

**Creating new budget:**
```bash
curl -X POST "http://localhost:3000/api/ads-budget" \
  -H "Content-Type: application/json" \
  -d '{
    "kodeAdsId": 1,
    "sumberLeadsId": 1,
    "budget": 5000000,
    "spent": 1000000,
    "periode": "2025-10",
    "createdBy": "Admin"
  }'
```

**Result:**
- If `budget > 0`: Creates history entry with `budgetHistory` array containing initial budget amount
- If `spent > 0`: Creates history entry with `spentHistory` array containing initial spent amount

**Updating existing budget:**
```bash
curl -X POST "http://localhost:3000/api/ads-budget" \
  -H "Content-Type: application/json" \
  -d '{
    "kodeAdsId": 1,
    "sumberLeadsId": 1,
    "budget": 7500000,
    "periode": "2025-10",
    "createdBy": "Admin"
  }'
```

**Result:**
- Calculates difference: `7500000 - 5000000 = 2500000`
- Appends to `budgetHistory` array with amount `2500000`

### PUT /api/ads-budget
When updating spent amount:

```bash
curl -X PUT "http://localhost:3000/api/ads-budget" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "spent": 3000000,
    "updatedBy": "Admin"
  }'
```

**Result:**
- Calculates difference: `3000000 - 1000000 = 2000000`
- Appends to `spentHistory` array with amount `2000000`

## Ads Spend API Changes

### GET /api/ads-spend
The response now includes actual transaction history instead of dummy data:

```json
{
  "success": true,
  "data": [
    {
      "kodeAds": "200",
      "channel": "Facebook Ads",
      "budget": 7500000,
      "budgetSpent": 3000000,
      "budgetHistory": [
        {
          "id": 1729350240123,
          "type": "budget",
          "amount": 5000000,
          "note": "Initial budget created",
          "createdBy": "Admin",
          "createdAt": "2025-10-18T10:30:40.123Z"
        },
        {
          "id": 1729350240124,
          "type": "budget",
          "amount": 2500000,
          "note": "Budget adjustment from 5000000 to 7500000",
          "createdBy": "Admin",
          "createdAt": "2025-10-18T10:35:20.456Z"
        }
      ],
      "spentHistory": [
        {
          "id": 1729350240125,
          "type": "spend",
          "amount": 1000000,
          "note": "Initial spend recorded",
          "createdBy": "Admin",
          "createdAt": "2025-10-18T10:36:00.789Z"
        },
        {
          "id": 1729350240126,
          "type": "spend",
          "amount": 2000000,
          "note": "Spend update from 1000000 to 3000000",
          "createdBy": "Admin",
          "createdAt": "2025-10-18T10:40:00.123Z"
        }
      ],
      ...otherFields
    }
  ]
}
```

## Frontend Display

### Detail Modal - History Tabs
The Detail Modal in `/src/app/(dashboard)/ads-spend/page.tsx` displays two tabs:

#### History Tambah Budget
Shows all budget additions:
- Amount added (in green highlight)
- Note/description
- Date and time of transaction
- User who made the transaction

#### History Update Spent
Shows all spend updates:
- Amount deducted (in red highlight)
- Note/description
- Date and time of transaction
- User who made the transaction

### Data Flow
```
User adds/updates budget/spend
    ↓
POST/PUT /api/ads-budget
    ↓
Calculate difference (new amount - old amount)
    ↓
Append to budgetHistory or spentHistory JSON array
    ↓
GET /api/ads-spend fetches data with history
    ↓
Frontend renders history entries in Detail Modal
```

## Transaction Recording Behavior

### Budget Addition
When budget is increased from `5M` to `7.5M`:
```json
{
  "id": 1729350240123,
  "type": "budget",
  "amount": 2500000,  // The increase amount
  "note": "Budget adjustment from 5000000 to 7500000",
  "createdBy": "Admin",
  "createdAt": "2025-10-18T10:30:40.123Z"
}
```

### Spend Update
When spend is updated from `1M` to `3M`:
```json
{
  "id": 1729350240124,
  "type": "spend",
  "amount": 2000000,  // The increase amount
  "note": "Spend update from 1000000 to 3000000",
  "createdBy": "Admin",
  "createdAt": "2025-10-18T10:35:20.456Z"
}
```

## Key Features

✅ **Individual Transaction Records**: Each change creates a separate entry  
✅ **Immutable History**: Past transactions cannot be modified, only new ones added  
✅ **Sortable by Date**: History sorted with newest entries first  
✅ **User Tracking**: Records which user made each transaction  
✅ **Difference-Based Amounts**: Stores the change amount, not cumulative total  
✅ **Type Filtering**: Can query specific types (budget vs spend)  
✅ **Timestamped**: ISO 8601 format for precise tracking  
✅ **Descriptive Notes**: Auto-generated or custom notes for context  

## Testing

Run the test script to verify the feature:
```bash
# Make sure the dev server is running
npm run dev

# In another terminal, run tests
chmod +x test-budget-history.sh
./test-budget-history.sh
```

The script will:
1. Create a new budget with initial amount
2. Check initial history
3. Add additional budget
4. Check budget history
5. Record spend updates
6. Check full history (budget + spend)
7. Check spend history only
8. Verify data in ads-spend response

## Migration Status

✅ Schema updated with JSON fields for history storage  
✅ Database synced with `prisma db push`  
✅ Prisma client generated  
✅ APIs implemented and tested  
✅ Frontend updated to display actual history  

## Future Enhancements

Potential future improvements:
- Archive/cleanup old history entries (e.g., keep only last 12 months)
- Bulk export history to CSV
- History comparison between periods
- Auto-categorization of transactions
- Budget forecasting based on history trends
- Approval workflow for large transactions
