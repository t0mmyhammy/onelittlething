# API Surface

## Overview

RESTful API with JSON payloads. Authentication via Supabase JWT tokens.

## Authentication

All endpoints require authentication unless marked `[Public]`.

```
Authorization: Bearer <jwt_token>
```

## Rate Limits

- Standard endpoints: 100 requests/minute per user
- AI endpoints: 10 requests/minute per user
- Public share views: 20 requests/minute per IP

## Endpoints

### Children

#### GET /api/children/:id/care-info
Get care information for a specific child.

**Response**
```json
{
  "id": "uuid",
  "child_id": "uuid",
  "routines": { ... },
  "routines_notes": "string",
  "routines_redacted_fields": ["field1", "field2"],
  "health": { ... },
  "comfort": { ... },
  "safety": { ... },
  "contacts": { ... }
}
```

#### POST /api/children/:id/care-info
Update care information for a child.

**Request**
```json
{
  "section": "routines",
  "data": { "wake_time": "7:00 AM" },
  "notes": "Updated morning routine"
}
```

**Response**
```json
{
  "success": true,
  "updated_at": "2025-01-12T10:30:00Z"
}
```

#### GET /api/children/:id/sizes
Get size tracking for a child.

**Response**
```json
{
  "sizes": [
    {
      "id": "uuid",
      "category": "tops",
      "current_size": "4T",
      "next_size": "5T",
      "updated_at": "2025-01-10T14:20:00Z"
    }
  ]
}
```

#### POST /api/children/:id/sizes
Update size information.

**Request**
```json
{
  "category": "tops",
  "current_size": "4T",
  "next_size": "5T"
}
```

#### GET /api/children/:id/ideas
Get ideas for a child.

**Query Params**
- `status` - Filter by status (active, added_to_wishlist, purchased, dismissed)
- `source` - Filter by source (ai, manual)

**Response**
```json
{
  "ideas": [
    {
      "id": "uuid",
      "title": "Warm rain jacket",
      "category": "outerwear",
      "size": "4T",
      "brand": "Patagonia",
      "notes": "Waterproof, lined",
      "status": "active",
      "source": "ai",
      "created_at": "2025-01-12T10:00:00Z"
    }
  ]
}
```

#### POST /api/children/:id/ideas
Add a new idea manually.

**Request**
```json
{
  "title": "Winter boots",
  "category": "shoes",
  "size": "10",
  "notes": "For snow days"
}
```

#### GET /api/children/:id/wishlist
Get wishlist items for a child.

**Response**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Lego set",
      "size": null,
      "brand": "Lego",
      "url": "https://...",
      "price_cents": 4999,
      "color": "multicolor",
      "status": "needed",
      "reserved_by": null
    }
  ]
}
```

#### POST /api/children/:id/wishlist
Add item to wishlist.

**Request**
```json
{
  "title": "Rain boots",
  "size": "10",
  "url": "https://...",
  "price_cents": 2999
}
```

### Family

#### GET /api/family/:id/care-info
Get family-wide care information.

**Response**
```json
{
  "id": "uuid",
  "family_id": "uuid",
  "home_base": { ... },
  "house_rules": { ... },
  "schedule": { ... },
  "emergency": { ... }
}
```

#### POST /api/family/:id/care-info
Update family care information.

**Request**
```json
{
  "section": "home_base",
  "data": { "wifi_network": "MyNetwork" },
  "notes": "Updated wifi info"
}
```

### Care Guides

#### POST /api/guides/generate
Generate a care guide from current data.

**Request**
```json
{
  "type": "babysitter",
  "child_ids": ["uuid1", "uuid2"],
  "family_id": "uuid",
  "title": "Weekend Babysitter Pack"
}
```

**Response**
```json
{
  "guide_id": "uuid",
  "content": { ... },
  "share_view": { ... }
}
```

#### GET /api/guides/:id
Get a specific care guide.

**Response**
```json
{
  "id": "uuid",
  "family_id": "uuid",
  "child_ids": ["uuid"],
  "type": "babysitter",
  "title": "Weekend Babysitter Pack",
  "content": { ... },
  "version": 1,
  "created_at": "2025-01-12T10:00:00Z"
}
```

#### PUT /api/guides/:id
Update a care guide (creates new version if shared).

**Request**
```json
{
  "title": "Updated Babysitter Pack",
  "content": { ... },
  "create_new_version": false
}
```

#### DELETE /api/guides/:id
Delete a care guide. Fails if active shares exist.

### Share Links

#### POST /api/shares
Create a new share link.

**Request**
```json
{
  "guide_id": "uuid",
  "expires_at": "2025-01-19T00:00:00Z",
  "passcode": "optional-secret",
  "viewer_role": "babysitter",
  "permissions": {
    "sections": ["routines", "emergency"]
  }
}
```

**Response**
```json
{
  "id": "uuid",
  "token": "uuid",
  "url": "https://app.onelittlething.com/share/uuid",
  "expires_at": "2025-01-19T00:00:00Z",
  "has_passcode": true
}
```

#### GET /api/shares
List all share links for the authenticated user.

**Response**
```json
{
  "shares": [
    {
      "id": "uuid",
      "guide_id": "uuid",
      "guide_title": "Babysitter Pack",
      "token": "uuid",
      "expires_at": "2025-01-19T00:00:00Z",
      "view_count": 3,
      "last_viewed_at": "2025-01-15T14:30:00Z",
      "revoked_at": null,
      "created_at": "2025-01-12T10:00:00Z"
    }
  ]
}
```

#### GET /api/shares/:id
Get details of a specific share link.

#### DELETE /api/shares/:id
Revoke a share link.

**Response**
```json
{
  "success": true,
  "revoked_at": "2025-01-15T16:00:00Z"
}
```

#### POST /api/shares/:id/mark-read
Log that a share link was accessed (called by viewer).

**Request**
```json
{
  "passcode": "optional-secret"
}
```

**Response**
```json
{
  "success": true,
  "content": { ... }
}
```

### AI Features

#### POST /api/ai/ideas
Generate AI ideas based on prompt and child context.

**Request**
```json
{
  "child_id": "uuid",
  "prompt": "warm rain gear for daycare",
  "size_context": {
    "tops": "4T",
    "bottoms": "4T",
    "outerwear": "4T"
  }
}
```

**Response**
```json
{
  "ideas": [
    {
      "title": "Waterproof rain jacket",
      "size": "4T-5T",
      "rationale": "Durable, machine washable, fits over layers",
      "category": "outerwear"
    }
  ],
  "tokens_used": 450
}
```

#### POST /api/ai/chat
Chat with Liv AI assistant.

**Request**
```json
{
  "message": "How do I pack for a beach day with toddlers?",
  "context": {
    "children": [{ "name": "Emma", "age": 3 }]
  }
}
```

**Response**
```json
{
  "response": "Here's what I suggest...",
  "tokens_used": 320
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": { ... }
}
```

### Common Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `unauthorized` | 401 | Missing or invalid auth token |
| `forbidden` | 403 | Authenticated but not allowed |
| `not_found` | 404 | Resource doesn't exist |
| `validation_error` | 400 | Invalid input data |
| `rate_limit_exceeded` | 429 | Too many requests |
| `server_error` | 500 | Internal server error |
| `expired` | 410 | Share link expired or revoked |
| `passcode_required` | 403 | Share requires passcode |
| `invalid_passcode` | 403 | Wrong passcode provided |

## Public Endpoints

#### GET /share/:token [Public]
View a shared care guide.

**Query Params**
- `passcode` - Optional passcode if required

**Response**
```json
{
  "title": "Babysitter Pack",
  "content": { ... },
  "viewer_role": "babysitter",
  "expires_at": "2025-01-19T00:00:00Z"
}
```

**Errors**
- `expired` - Link expired or revoked
- `passcode_required` - Passcode needed
- `invalid_passcode` - Wrong passcode
