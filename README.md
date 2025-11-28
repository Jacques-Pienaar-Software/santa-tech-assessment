**Project**: santa-tech-assessment

### Initial Assumptions:

- Managers can only invite users to an organization if the user exists

## Setup instructions

1. **Clone the repo**

```bash
git clone <REPO_URL>
cd <REPO_FOLDER>
```

2. **Copy environment variables**

```bash
cp .env.example .env
```

2. **Start the docker engine**

```bash
docker compose up --build
```

## API Endpoint Documentation

All protected API endpoints use **Bearer token auth**

## Auth

#### POST /auth/register

Registers a new user

**Body**

```json
{
  "name": "jacques",
  "email": "jacques@example.com",
  "password": "supersecret",
  "role": "MANAGER"
}
```

**Responses**

- `201` – success
- `400` – validation error
- `409` – user already exists

#### POST /auth/login

Returns a token + user info.

**Body**

```json
{
  "email": "jacques@example.com",
  "password": "supersecret"
}
```

**Responses**

- `200` – success
- `400` – validation error
- `401` – invalid credentials

## Profile

#### GET /profile

Returns profile of logged-in user including organizations.

**Responses**

```json
{
  "id": "user_123",
  "name": "Jacques",
  "email": "jacques@example.com",
  "role": "MANAGER",
  "organizations": [
    {
      "id": "org_1",
      "name": "NPR Records"
    }
  ]
}
```

- `200` – success
- `401` – unauthorized

## Organization

#### POST /organizations

Create an organization (MANAGER only)

**body**

```json
{
  "name": "string"
}
```

**Responses**

- `201` – Organization Created
- `400` – Invalid input
- `401` – unauthorized
- `403` – Managers only

#### POST /organization/{orgId}/managers

Add a MANAGER to an organization (MANAGER only)

**body**

```json
{
  "email": "user@example.com"
}
```

**Responses**

- `201` – Manager added to organization
- `400` – Invalid input or organization not found
- `401` – unauthorized
- `403` – Managers only
- `409` - User is already a member of this organization

#### POST /organizations/{orgId}/invites

Invite a SONGWRITER to an organization (MANAGER only)

**body**

```json
{
  "email": "user@example.com"
}
```

**Responses**

- `201` – Invite created
- `400` – Invalid input or organization not found
- `401` – unauthorized
- `403` – Managers only
- `409` - User already has a pending invite or is already a member

#### GET organizations/invites

List pending organization invites for the current user.

**Responses**

- `200` – List of pending invites
- `401` – unauthorized

#### POST organizations/invites/{inviteId}/respond

Respond to an organization invite

**body**

```json
{
  "decision": "ACCEPT"
}
```

**responses**

- `200` – Invite updated. If ACCEPT, membership created (if needed).
- `400` – Invalid input or invite not found
- `401` – unauthorized
- `403` – Current user is not the invitee for this invite
- `409` – Invite has already been responded to

## Media

#### GET /media

Returns all media belonging to organizations where the current user is a member.

**responses**

- `200` – Media list returned
- `401` – Unauthorized

#### POST /media

Uploads a media file (MP3/MP4/WAV) and associates it with an organization. The uploader must be a member of the organization and is automatically added as a MediaAuthor for the new media.

| **body**                       |                                                                   |
| ------------------------------ | ----------------------------------------------------------------- |
| title \*<br><br>string         | Title of the track.                                               |
| orgId \*<br><br>string         | ID of the organization the media belongs to.                      |
| duration \*<br><br>string      | Duration as a string (e.g. '03:45').                              |
| file \*<br><br>string($binary) | The media file (audio/video). Only MP3, WAV, and MP4 are accepted |

**responses**

- `201` – Media created
- `400` - Invalid input or file missing/invalid
- `401` – Unauthorized
- `403` - User is not a member of the specified organization and cannot upload media to it.

## Pitches

#### GET pitch/pitches

Returns pitches where the user is a **target artist**.

**Responses**

```json
[
  {
    "id": "string",
    "description": "string",
    "mediaId": "string",
    "authorUserId": "string",
    "authorOrgId": "string",
    "media": {
      "id": "string",
      "title": "string",
      "duration": "string",
      "filePath": "string",
      "orgId": "string",
      "createdAt": "2025-11-28T18:19:20.441Z"
    },
    "tags": [
      {
        "id": "string",
        "tagValue": "string"
      }
    ],
    "targetAuthors": [
      {
        "pitchId": "string",
        "mediaId": "string",
        "targetUserId": "string",
        "targetOrgId": "string"
      }
    ],
    "commentor": {
      "userId": "string",
      "orgId": "string",
      "user": {
        "id": "string",
        "name": "string",
        "email": "user@example.com",
        "role": "SONGWRITER"
      },
      "organization": {
        "id": "string",
        "name": "string"
      }
    }
  }
]
```

- `200` – success
- `401` – unauthorized

#### POST pitch/{mediaId}/pitches

Create a pitch for a song (MANAGER only)

**Body**

```json
{
  "description": "string",
  "tags": ["string"],
  "targetAuthors": [
    {
      "mediaId": "string",
      "targetUserId": "string",
      "targetOrgId": "string"
    }
  ]
}
```

- `201` – Pitch Created
- `400` – Invalid input, media not found, or mismatched targetAuthors.mediaId
- `401` – unauthorized
- `403` – Caller must be a MANAGER and member of the organization that owns the media
- `404` - Media not found

#### DELETE pitch/pitches/{pitchId}

Delete a pitch (MANAGER only)

**Responses**

```json
{
  "success": true
}
```

- `200` – Pitch deleted successfully
- `401` – unauthorized
- `403` – Caller must be a MANAGER and member of the organization that owns the media
- `404` - Pitch not found
- `500` - Server error

## Example requests

#### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"jacques","email":"jacques@example.com","password":"secret","role":"MANAGER"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jacques@example.com","password":"secret"}'

```

#### Create organization

```bash
curl -X POST http://localhost:3000/organizations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "Coffee Colour Records"}'
```

#### Upload Media

```bash
curl -X POST http://localhost:3000/media \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@track.mp3" \
  -F "orgId=org_123" \
  -F "title=Demo Track" \
  -F "duration=03:45"
```

## Assumptions

- The API runs at `http://localhost:3000`.
- `.env` is correctly configured (database URL, auth secrets, etc.).

- `docker-compose` runs MySQL + the Node.js service.

- Users authenticate via BetterAuth session tokens passed via `Authorization: Bearer <token>`.

- Only MANAGERS can:
  - Create organizations
  - Add managers
  - Send invites
  - Create/update/delete pitches
- All users can:
  - Upload media for organizations they belong to
  - View their own profile
  - View pitches where they are targeted
