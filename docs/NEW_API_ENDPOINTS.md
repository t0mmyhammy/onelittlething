# New API Endpoints Documentation

This document covers API endpoints added in v1.8 for Reminders, Pack Lists, and Ready for Baby features.

## Authentication

All endpoints require authentication via Supabase Auth. The user must be authenticated and part of a family.

---

## Reminders

### Import Reminders from Text
**POST** `/api/import-reminders`

Parse natural language text into reminder objects.

**Request Body:**
```json
{
  "text": "Pick up groceries tomorrow\nCall dentist next week\nBuy birthday present",
  "familyId": "uuid"
}
```

**Response:**
```json
{
  "reminders": [
    {
      "title": "Pick up groceries",
      "dueDate": "2025-11-14",
      "priority": "medium"
    },
    {
      "title": "Call dentist",
      "dueDate": "2025-11-20",
      "priority": "low"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Missing familyId or text
- `500` - OpenAI API error

---

## Pack Lists

### Generate Pack List from AI
**POST** `/api/generate-pack-list`

Generate a complete pack list using AI based on a prompt.

**Request Body:**
```json
{
  "prompt": "3-day beach vacation with toddler",
  "familyId": "uuid",
  "children": [
    { "name": "Emma", "birthdate": "2022-05-15" }
  ]
}
```

**Response:**
```json
{
  "name": "Beach Vacation Pack List",
  "categories": [
    {
      "title": "Beach Essentials",
      "items": [
        { "label": "Sunscreen SPF 50", "quantity": 2 },
        { "label": "Beach umbrella" }
      ]
    }
  ]
}
```

### Parse Pack List from Text
**POST** `/api/parse-pack-list`

Parse formatted text into structured pack list data.

**Request Body:**
```json
{
  "text": "Beach Essentials:\n- Sunscreen\n- Towels (3)\n\nClothing:\n- Swimsuit\n- Cover-up"
}
```

**Response:**
```json
{
  "categories": [
    {
      "title": "Beach Essentials",
      "items": [
        { "label": "Sunscreen", "quantity": null },
        { "label": "Towels", "quantity": 3 }
      ]
    },
    {
      "title": "Clothing",
      "items": [
        { "label": "Swimsuit", "quantity": null }
      ]
    }
  ]
}
```

### Import Pack List Items
**POST** `/api/import-pack-list-items`

Create pack list items in bulk from parsed data.

**Request Body:**
```json
{
  "packListId": "uuid",
  "categories": [
    {
      "title": "Beach Essentials",
      "items": [
        { "label": "Sunscreen", "quantity": 2 }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "itemsCreated": 5
}
```

### Generate Hospital Bags from Template
**POST** `/api/generate-hospital-bags`

Auto-generate pack lists from templates (hospital bags, road trip, beach, camping).

**Request Body:**
```json
{
  "familyId": "uuid",
  "hasOlderChildren": false,
  "templateId": "hospital-bags"
}
```

**Template IDs:**
- `hospital-bags` - Generates 3-5 hospital bag lists (Mom, Partner, Baby, + extras if `hasOlderChildren: true`)
- `road-trip` - Road trip essentials
- `beach-vacation` - Beach vacation pack list
- `camping-trip` - Camping trip essentials

**Response:**
```json
{
  "success": true,
  "packListIds": ["uuid1", "uuid2", "uuid3"],
  "message": "Successfully created 3 hospital bag pack lists"
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Missing familyId or templateId
- `403` - User not member of family
- `404` - Template not found

---

## Ready for Baby

### Enhance Baby Name with AI
**POST** `/api/enhance-baby-name`

Get AI-generated information about a baby name including meaning, origin, popularity, and sibling compatibility.

**Request Body:**
```json
{
  "name": "Olivia",
  "type": "F"
}
```

**Type Values:**
- `F` - Female/Girl
- `M` - Male/Boy
- `N` - Neutral/Unisex

**Response:**
```json
{
  "enhancements": {
    "meaning": "Derived from the Latin word 'oliva' meaning olive tree, symbolizing peace and wisdom",
    "origin": "Latin origin, popularized by Shakespeare's Twelfth Night",
    "popularity": "Currently #1 in the US, has been top 10 for over a decade",
    "siblingCompatibility": "Pairs well with classic names like Emma, Ava, Noah, or Liam"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Missing name or type
- `500` - OpenAI API error

---

## Rate Limits

- All OpenAI-powered endpoints are subject to OpenAI's rate limits
- Recommended to implement client-side debouncing for AI features
- Consider caching AI responses when appropriate

---

## Error Response Format

All endpoints return errors in this format:

```json
{
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for this resource)
- `404` - Not Found
- `500` - Internal Server Error

---

## Edge Runtime

All these endpoints use Edge Runtime for improved performance and global distribution. This means:
- Fast cold starts
- Global deployment
- Limited to Edge-compatible APIs
- No access to Node.js-specific features

---

**Last Updated:** November 13, 2025
