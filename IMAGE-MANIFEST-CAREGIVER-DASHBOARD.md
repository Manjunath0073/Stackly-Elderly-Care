# Stackly Elderly Care — Caregiver Dashboard image manifest

The dashboard reuses the shared dashboard shell (`css/dashboard.css`) and only existing local
`.webp` assets (no new downloads). Every file is well below the 99 KB limit.

| File | Dimensions | File size | Where used |
| --- | ---: | ---: | --- |
| `images/logo/logo-stackly.webp` | 346 x 100 | 6,584 B (6.4 KB) | Sidebar brand logo |
| `images/avatar-sara.webp` | 160 x 160 | 4,834 B (4.7 KB) | Client / review / message avatars |
| `images/avatar-robert.webp` | 160 x 160 | 4,692 B (4.6 KB) | Client / review / message avatars |
| `images/avatar-amira.webp` | 160 x 160 | 2,860 B (2.8 KB) | Client / review / message avatars |
| `images/caregiver-elena.webp` | 320 x 400 | 9,722 B (9.5 KB) | Care-team message avatar |

The signed-in caregiver's avatar is rendered as initials in a teal circle (no image), unless
`stackly_user.avatar` is provided, in which case that path is used.

**Largest file used:** `caregiver-elena.webp` at 9.5 KB — under the 99 KB limit.
