# API Reference

Base path: `/api/v1`

All responses are JSON. Success shape: `{ success: true, data: ... }`. Error shape: `{ success: false, error: "message" }`.

---

## Public endpoints

These endpoints are accessible without authentication. Rate limits apply.

---

### Settings

#### `GET /api/v1/settings/public`

Returns a filtered subset of `SiteSettings` safe for public consumption (excludes admin credentials, internal notes, etc.).

**Rate limit:** 30 req/min

**Response:**
```json
{
  "success": true,
  "data": {
    "coupleName": "Jacob & Jane Campbell",
    "weddingDate": "2025-10-11",
    "weddingTime": "5:00 PM",
    "venueName": "The Grand Venue",
    "venueAddress": "123 Wedding Lane, Apopka, FL",
    "heroTagline": "Join us as we say I do",
    "heroTaglinePostWedding": "Thank you for celebrating with us",
    "bannerText": null,
    "bannerUrl": null,
    "bannerActive": false,
    "bannerColor": "#b8860b",
    "socialInstagram": null,
    "socialFacebook": null,
    "socialTikTok": null,
    "rsvpEnabled": true,
    "rsvpDeadline": null
  }
}
```

---

### RSVP

#### `POST /api/v1/rsvp/lookup`

Look up a guest by name to start the RSVP flow.

**Rate limit:** 20 req/min

**Request body:**
```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response (found):**
```json
{
  "success": true,
  "data": {
    "guest": {
      "id": "cuid",
      "firstName": "John",
      "lastName": "Smith",
      "plusOneAllowed": true,
      "plusOneName": null,
      "rsvpStatus": "pending",
      "mealPreference": null,
      "dietaryNeeds": null,
      "songRequest": null
    },
    "mealOptions": [
      { "id": "cuid", "name": "Chicken", "description": "...", "isVegetarian": false, "isVegan": false, "isGlutenFree": false }
    ]
  }
}
```

**Response (not found):** `404` with `{ success: false, error: "Guest not found" }`

---

#### `POST /api/v1/rsvp/submit`

Submit or update an RSVP.

**Rate limit:** 5 req/min

**Request body:**
```json
{
  "guestId": "cuid",
  "attending": true,
  "mealPreferenceId": "cuid",
  "dietaryNeeds": "No nuts",
  "songRequest": "Dancing Queen",
  "plusOneAttending": true,
  "plusOneName": "Jane Smith",
  "plusOneMealPreferenceId": "cuid"
}
```

**Notes:**
- `attending: false` sets `rsvpStatus = "declined"`, ignores meal fields
- `songRequest` is optional; creates a `SongRequest` record if provided
- Requires `rsvpEnabled` feature flag to be on

---

### Guest Book

#### `POST /api/v1/guestbook`

Submit a guest book entry. Entry is pending admin approval before becoming visible.

**Request body:**
```json
{
  "name": "John Smith",
  "message": "Congratulations!"
}
```

**Notes:** Requires `guestBookEnabled` feature flag.

---

### Contact

#### `POST /api/v1/contact`

Submit a contact message. Stored in `ContactMessage` table; no email is sent.

**Request body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Question about parking",
  "message": "Is there free parking at the venue?"
}
```

**Notes:** Requires `contactPageEnabled` feature flag.

---

### Music

#### `GET /api/v1/music/search?q={query}`

Proxy to the iTunes Search API. Returns tracks matching the search query.

**Rate limit:** 15 req/min

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "trackId": 12345,
        "trackName": "Dancing Queen",
        "artistName": "ABBA",
        "artworkUrl": "https://...",
        "previewUrl": "https://..."
      }
    ]
  }
}
```

---

#### `POST /api/v1/music/requests`

Submit a song request.

**Rate limit:** 10 req/min

**Request body:**
```json
{
  "guestName": "John Smith",
  "songTitle": "Dancing Queen",
  "artist": "ABBA",
  "artworkUrl": "https://...",
  "previewUrl": "https://..."
}
```

**Notes:** Requires `songRequestsEnabled` feature flag. Submission is pending admin approval before appearing publicly.

---

#### `GET /api/v1/music/dj-playlist`

Returns the DJ's curated must-play and do-not-play lists.

**Response:**
```json
{
  "success": true,
  "data": {
    "mustPlay": [
      { "id": "cuid", "songName": "...", "artist": "...", "playTime": "First Dance" }
    ],
    "doNotPlay": [
      { "id": "cuid", "songName": "...", "artist": "..." }
    ]
  }
}
```

---

### Photos

#### `POST /api/v1/photos/upload`

Upload a guest photo. Requires `photoUploadEnabled` feature flag.

**Content-Type:** `multipart/form-data`

**Form fields:**
- `file` — image file (jpg, png, webp, gif)
- `uploadedBy` — guest name (string)
- `caption` — optional caption

**Notes:** Uploaded to Cloudinary (or local storage if `STORAGE_PROVIDER=local`). Photo is pending admin approval.

---

### Weather

#### `GET /api/v1/weather`

Returns weather data for the venue on the wedding date.

**Rate limit:** 10 req/5min

**Logic:**
- If wedding date is ≤16 days away: fetches hourly forecast from Open-Meteo
- Otherwise: fetches historical data for the same calendar date over the past 5 years, averages them
- If no historical data available: returns static Central Florida summer averages

**Response (forecast mode):**
```json
{
  "success": true,
  "data": {
    "mode": "forecast",
    "date": "2025-10-11",
    "hourly": [
      { "hour": 14, "temp": 82, "precipitation": 0.1, "weatherCode": 3, "emoji": "⛅" }
    ],
    "daily": {
      "tempMin": 72,
      "tempMax": 88,
      "precipitationSum": 0.3,
      "weatherCode": 61,
      "emoji": "🌦"
    }
  }
}
```

---

### Registry

#### `POST /api/v1/registry/contribute`

Record a contribution to a registry fund item.

**Request body:**
```json
{
  "registryItemId": "cuid",
  "guestName": "John Smith",
  "guestEmail": "john@example.com",
  "amount": 50
}
```

**Notes:** Creates a `RegistryContribution` record and updates `raisedAmount` on the `RegistryItem`. Does not process payment.

---

### Site Password

#### `POST /api/v1/site-password`

Verify the site password. On success, sets a cookie granting access.

**Request body:**
```json
{
  "password": "secret"
}
```

**Response:** `200` on match, `401` on mismatch. Sets `site_password` cookie on success.

---

## Admin endpoints

All admin endpoints require a valid NextAuth session cookie (obtained by logging in at `/admin/login`). Unauthenticated requests receive `401`.

---

### Settings

#### `GET /api/v1/admin/settings`

Returns all 49 SiteSettings fields. The `sitePassword` field is returned as `"••••••••"` if set.

#### `PUT /api/v1/admin/settings`

Update any SiteSettings fields. Partial updates accepted (only include fields you want to change).

**Key fields:**
- `coupleName`, `weddingDate`, `weddingTime`
- `venueName`, `venueAddress`
- `heroTagline`, `heroTaglinePostWedding`
- `childrenPolicy`, `parkingInfo`, `travelContent`, `faqContent`, `weatherInfo`
- `contactEmailJoint`, `contactEmailBride`, `contactEmailGroom`, `notificationEmail`
- `sitePasswordEnabled`, `sitePassword` (plain text; server bcrypt-hashes it)
- `rsvpEnabled`, `rsvpDeadline`
- `bannerText`, `bannerUrl`, `bannerColor`, `bannerActive`
- `socialInstagram`, `socialFacebook`, `socialTikTok`
- `hideUnconfirmedWeddingParty`
- `ogDescription`, `ogImageUrl`

---

### Feature Flags

#### `GET /api/v1/admin/features`

Returns all 20 feature flags with their current enabled state.

#### `PUT /api/v1/admin/features`

Toggle one or more feature flags.

**Request body:**
```json
{
  "rsvpEnabled": false,
  "photoUploadEnabled": true
}
```

---

### Guests

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/guests` | List all guests |
| `POST` | `/api/v1/admin/guests` | Create a guest |
| `GET` | `/api/v1/admin/guests/[id]` | Get a single guest |
| `PUT` | `/api/v1/admin/guests/[id]` | Update a guest |
| `DELETE` | `/api/v1/admin/guests/[id]` | Delete a guest |

**Guest fields:** `firstName`, `lastName`, `email`, `phone`, `group`, `rsvpStatus`, `plusOneAllowed`, `plusOneName`, `mealPreference`, `dietaryNeeds`, `childrenCount`, `tableNumber`, `notes`

---

### Content — Timeline

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/content/timeline` | List all timeline events |
| `POST` | `/api/v1/admin/content/timeline` | Create an event |
| `GET` | `/api/v1/admin/content/timeline/[id]` | Get a single event |
| `PUT` | `/api/v1/admin/content/timeline/[id]` | Update an event |
| `DELETE` | `/api/v1/admin/content/timeline/[id]` | Delete an event |

**Fields:** `title`, `time`, `description`, `icon`, `eventType` (wedding-day|pre-wedding|post-wedding), `sortOrder`

---

### Content — FAQs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/content/faqs` | List all FAQs |
| `POST` | `/api/v1/admin/content/faqs` | Create a FAQ |
| `GET` | `/api/v1/admin/content/faqs/[id]` | Get a single FAQ |
| `PUT` | `/api/v1/admin/content/faqs/[id]` | Update a FAQ |
| `DELETE` | `/api/v1/admin/content/faqs/[id]` | Delete a FAQ |

**Fields:** `question`, `answer`, `sortOrder`, `isVisible`

---

### Wedding Party

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/wedding-party` | List all members |
| `POST` | `/api/v1/admin/wedding-party` | Create a member |
| `GET` | `/api/v1/admin/wedding-party/[id]` | Get a single member |
| `PUT` | `/api/v1/admin/wedding-party/[id]` | Update a member |
| `DELETE` | `/api/v1/admin/wedding-party/[id]` | Delete a member |

**Fields:** `name`, `role`, `side` (bride|groom), `relationToBrideOrGroom`, `spouseOrPartner`, `bio`, `photoUrl`, `sortOrder`, `confirmed`

---

### Photos

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/photos` | List all photos |
| `POST` | `/api/v1/admin/photos` | Create a photo record |
| `GET` | `/api/v1/admin/photos/[id]` | Get a single photo |
| `PUT` | `/api/v1/admin/photos/[id]` | Update a photo |
| `DELETE` | `/api/v1/admin/photos/[id]` | Delete a photo |
| `PUT` | `/api/v1/admin/photos/[id]/approve` | Approve or reject a photo |
| `GET` | `/api/v1/admin/photos/tags` | List all photo tags |
| `POST` | `/api/v1/admin/photos/tags` | Create a tag |
| `PUT` | `/api/v1/admin/photos/tags/[tagId]` | Update a tag |
| `DELETE` | `/api/v1/admin/photos/tags/[tagId]` | Delete a tag |
| `PUT` | `/api/v1/admin/photos/[id]/tags` | Replace all tags on a photo |

---

### Registry

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/registry` | List all items |
| `POST` | `/api/v1/admin/registry` | Create an item |
| `GET` | `/api/v1/admin/registry/[id]` | Get a single item |
| `PUT` | `/api/v1/admin/registry/[id]` | Update an item |
| `DELETE` | `/api/v1/admin/registry/[id]` | Delete an item |
| `GET` | `/api/v1/admin/registry/[id]/contributions` | List contributions for an item |

---

### Hotels

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/hotels` | List all hotels |
| `POST` | `/api/v1/admin/hotels` | Create a hotel |
| `GET` | `/api/v1/admin/hotels/[id]` | Get a single hotel |
| `PUT` | `/api/v1/admin/hotels/[id]` | Update a hotel |
| `DELETE` | `/api/v1/admin/hotels/[id]` | Delete a hotel |

---

### Entertainment

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/entertainment` | List all items |
| `POST` | `/api/v1/admin/entertainment` | Create an item |
| `GET` | `/api/v1/admin/entertainment/[id]` | Get a single item |
| `PUT` | `/api/v1/admin/entertainment/[id]` | Update an item |
| `DELETE` | `/api/v1/admin/entertainment/[id]` | Delete an item |

---

### Music — Song Requests

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/music/requests` | List all song requests |
| `GET` | `/api/v1/admin/music/requests/[id]` | Get a single request |
| `PUT` | `/api/v1/admin/music/requests/[id]` | Update a request |
| `DELETE` | `/api/v1/admin/music/requests/[id]` | Delete a request |
| `PUT` | `/api/v1/admin/music/requests/[id]/approve` | Approve or reject |
| `PUT` | `/api/v1/admin/music/requests/[id]/visibility` | Show or hide |

---

### Music — DJ List

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/music/dj-list` | List all DJ list entries |
| `POST` | `/api/v1/admin/music/dj-list` | Add a song to DJ list |
| `GET` | `/api/v1/admin/music/dj-list/[id]` | Get a single entry |
| `PUT` | `/api/v1/admin/music/dj-list/[id]` | Update an entry |
| `DELETE` | `/api/v1/admin/music/dj-list/[id]` | Remove from DJ list |

**Fields:** `songName`, `artist`, `listType` (must-play|do-not-play), `playTime`

---

### Music — Apple Music

#### `POST /api/v1/admin/music/apple-music/search`

Search the Apple Music catalog (requires `APPLE_MUSIC_*` env vars).

**Request body:** `{ "query": "ABBA Dancing Queen" }`

#### `POST /api/v1/admin/music/apple-music/import`

Import all tracks from an Apple Music playlist URL.

**Request body:** `{ "url": "https://music.apple.com/us/playlist/..." }`

---

### Meals

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/meals` | List all meal options |
| `POST` | `/api/v1/admin/meals` | Create a meal option |
| `GET` | `/api/v1/admin/meals/[id]` | Get a single option |
| `PUT` | `/api/v1/admin/meals/[id]` | Update a meal option |
| `DELETE` | `/api/v1/admin/meals/[id]` | Delete a meal option |

**Fields:** `name`, `description`, `sortOrder`, `isAvailable`, `isVegetarian`, `isVegan`, `isGlutenFree`

---

### Guest Book (admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/guest-book` | List all entries |
| `GET` | `/api/v1/admin/guest-book/[id]` | Get a single entry |
| `PUT` | `/api/v1/admin/guest-book/[id]` | Update an entry |
| `DELETE` | `/api/v1/admin/guest-book/[id]` | Delete an entry |
| `PUT` | `/api/v1/admin/guest-book/[id]/approve` | Approve or reject |

---

### Contact Messages

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/admin/messages` | List all messages |
| `GET` | `/api/v1/admin/messages/[id]` | Get a single message |
| `PUT` | `/api/v1/admin/messages/[id]` | Update a message |
| `DELETE` | `/api/v1/admin/messages/[id]` | Delete a message |
| `PUT` | `/api/v1/admin/messages/[id]/read` | Mark as read |

---

## Rate limiting

Rate limits are applied per-IP using an in-memory sliding window. Limits reset when the server restarts (no Redis).

| Endpoint | Limit |
|----------|-------|
| `/api/v1/settings/public` | 30 req/min |
| `/api/v1/music/search` | 15 req/min |
| `/api/v1/weather` | 10 req/5min |
| `/api/v1/rsvp/submit` | 5 req/min |
| `/api/v1/rsvp/lookup` | 20 req/min |
| `/api/v1/music/requests` | 10 req/min |
| `/api/v1/contact` | 5 req/min |
| `/api/v1/guestbook` | 5 req/min |

Admin endpoints are not rate-limited (authentication is the gate).
