# Task Plan — Assignment 1 Completion

**Current Score: 70.5 / 100**
**Target: ~90+ / 100**
**Deadline: Feb 19 (mostly done by Feb 18)**

---

## Day 1 — Feb 17 (Light Day: ~8 marks, quick wins & polish)

### Morning: Organizer Profile Fixes (~2.5 marks)

- [ ] **Add contact number** field to Organizer schema (`User.js`) + profile page + update route
- [ ] **Discord webhook**: Add `discordWebhook` field to User model, input on organizer profile, trigger POST on event publish

### Afternoon: Frontend Fixes (~3 marks)

- [ ] **Organizer navbar**: Change "Manage Events" → "Ongoing Events"
- [ ] **Organizer dashboard carousel**: Use a simple horizontal scroll/carousel for event cards
- [ ] **Participant dashboard**: Display organizer name on event cards (populate organizerId)
- [ ] **Participant dashboard**: Add "Cancelled/Rejected" filter tab
- [ ] **Organizer detail page**: Show contact email in `participantorganizerview.jsx`
- [ ] **Ticket emails**: Include participant name + event dates in email template

### Evening: More Feature Fixes (~2.5 marks)

- [ ] **Form builder**: Add "file upload" field type to enum + rendering
- [ ] **Participant profile**: Add password change mechanism
- [ ] **QR Scanner**: Add manual attendance override button + basic audit log
- [ ] **Participant search/filter** on organizer's event detail page
- [ ] **Interest-based event ordering** on browse events (sort followed/interest events to top)

---

## Day 2 — Feb 18 (Heavy Day: ~15 marks at stake)

### Morning: Deployment + README (~7 marks)

- [ ] **Deploy backend** to Render/Railway
- [ ] **Deploy frontend** to Vercel/Netlify
- [ ] **Switch to MongoDB Atlas** (update MONGO_URI)
- [ ] **Create `deployment.txt`** in root with Frontend URL + Backend URL
- [ ] **Create root `README.md`**:
  - Libraries used + justification (bcryptjs, jsonwebtoken, nodemailer, qrcode, multer, html5-qrcode, axios, react-router-dom, etc.)
  - Advanced features: Tier A (Merch Approval + QR Scanner), Tier B (Password Reset + ???), Tier C (CAPTCHA)
  - Setup & installation instructions

### Afternoon: 2nd Tier B Feature (~6 marks)

Pick ONE of these (Real-Time Discussion Forum is probably easiest to score well on):

- [ ] **Real-Time Discussion Forum** on Event Details page
  - Add `Message` model (eventId, userId, text, timestamp, pinned, parentId for threading)
  - Backend: CRUD routes for messages (post, get, delete/pin for organizer)
  - Frontend: chat-like section on `participanteventview.jsx` for registered participants
  - Organizer moderation (delete/pin) on `editEvents.jsx`
  - Optional: socket.io for real-time, or just polling every 5s

### Evening: Quick Fixes + Testing (~2 marks)

- [ ] **Fuzzy search**: Install `fuse.js`, apply on event search results in `browseevents.jsx` or backend
- [ ] **Organizer name search**: Add organizer name lookup in `/getAllEvents` search query
- [ ] **Trending events**: Add `/getTrendingEvents` endpoint (top 5 by registrations in last 24h)
- [ ] Test all flows end-to-end (register → login → browse → register for event → QR scan)
- [ ] Test deployment works
- [ ] Verify README is complete

---

## Day 3 — Feb 19 (Buffer Day: Polish & Emergency Fixes)

- [ ] Fix any bugs found during Day 2 testing
- [ ] Final deployment check — ensure URLs in `deployment.txt` are live
- [ ] Final README review
- [ ] **ZIP and submit**

---

## Priority Cheat Sheet (if running out of time)

| Priority | Task | Marks |
|---|---|---|
| 🔴 P0 | Deploy + deployment.txt | **5** |
| 🔴 P0 | 2nd Tier B feature (Discussion Forum) | **6** |
| 🔴 P0 | README.md | **penalty avoidance** |
| 🟡 P1 | Fuzzy search + trending | **~2** |
| 🟡 P1 | Discord webhook | **~2** |
| 🟡 P1 | Organizer contact number | **~0.5** |
| 🟠 P2 | File upload field type | **~1** |
| 🟠 P2 | Manual attendance override | **~2** |
| 🟠 P2 | Password change for participants | **~0.5** |
| 🟢 P3 | Carousel, navbar label, email content, filters | **~2** |
| 🟢 P3 | Interest-based recommendations | **~1** |

> **If you only finish P0 tasks, you jump from 70.5 → ~82+**
> **P0 + P1 gets you to ~87+**
> **P0 + P1 + P2 gets you to ~90+**
