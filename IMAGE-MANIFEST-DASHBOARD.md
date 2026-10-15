# Stackly Elderly Care — Family Dashboard image manifest

The dashboard uses only existing local `.webp` assets (no new downloads). Every file is well
below the required 99 KB limit.

| File | Dimensions | File size | Where used |
| --- | ---: | ---: | --- |
| `images/logo/logo-stackly.webp` | 346 x 100 | 6,584 B (6.4 KB) | Sidebar brand logo |
| `images/caregiver-elena.webp` | 320 x 400 | 9,722 B (9.5 KB) | Appointment & activity avatars |
| `images/caregiver-james.webp` | 320 x 400 | 10,064 B (9.8 KB) | Appointment & activity avatars |
| `images/caregiver-maya.webp` | 320 x 400 | 11,238 B (11.0 KB) | Appointment & activity avatars |

The signed-in user's avatar is rendered as initials in a teal circle (no image), unless
`stackly_user.avatar` is provided, in which case that path is used.

**Largest file used:** `caregiver-maya.webp` at 11.0 KB — under the 99 KB limit.
