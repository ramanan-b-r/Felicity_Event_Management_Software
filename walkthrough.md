# Felicity Event Management System — Detailed Scoring Assessment (Updated)

> Full re-scan of the codebase against every line of the rubric.

---

## Part 1: Core System Implementation [70 Marks]

### Section 4 — Authentication & Security [8 Marks]

#### 4.1 Registration & Login [3 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| IIIT email domain validation | ✅ | [User.js:42-46](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/models/User.js#L42-L46) — auto-assigns `participanttype` based on `@students.iiit.ac.in` / `@research.iiit.ac.in` |
| Non-IIIT register with email+password | ✅ | Same register static method covers both |
| Organizer: no self-registration | ✅ | `/register` hard-codes `role: "participant"` ([UserRoutes.js:175](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L175)) |
| Organizer accounts provisioned by Admin | ✅ | `/createOrganizer` route with admin check ([UserRoutes.js:275-314](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L275-L314)) |
| Organizer password resets handled by Admin | ✅ | Full workflow: request → admin approve/reject → new password ([UserRoutes.js:452-540](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L452-L540)) |
| Admin: first user, backend-only provisioned | ✅ | No admin registration UI; admin seeded in DB |

**Score: 3 / 3**

#### 4.2 Security Requirements [3 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| bcrypt password hashing | ✅ | [User.js:48-49](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/models/User.js#L48-L49) |
| JWT-based auth for protected routes | ✅ | [authMiddleware.js](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/middleware/authMiddleware.js) used on all protected endpoints |
| Role-based access control on frontend | ✅ | [RoleProtection.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/components/RoleProtection.jsx) + per-page role checks |

**Score: 3 / 3**

#### 4.3 Session Management [2 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Login redirects to respective dashboard | ✅ | [login.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/login.jsx) redirects by role |
| Sessions persist across browser restarts | ✅ | Token stored in `localStorage` |
| Logout clears all auth tokens | ✅ | [logout.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/logout.jsx) clears localStorage |

**Score: 2 / 2**

#### **Section 4 Total: 8 / 8** ✅

---

### Section 5 — User Onboarding & Preferences [3 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Select areas of interest | ✅ | [useronboarding.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/useronboarding.jsx) — comma-separated interests |
| Follow Clubs/Organizers during onboarding | ⚠️ Partial | After saving interests, redirects to `/clubs` page with alert. Not a single-step onboarding flow, but clubs page is immediately shown |
| Skip and configure later | ✅ | Onboarding is optional, preferences editable from Profile |
| Preferences stored in DB | ✅ | `interests` and `followedClubs` in User model |
| Editable from Profile page | ✅ | [profile.jsx:80-93](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/profile.jsx#L80-L93) for interests; followed clubs shown |
| Preferences influence event ordering | ❌ | No recommendation/ordering logic based on interests |

> **Gap**: No interest-based event recommendations or personalized ordering.

**Score: 2 / 3** (interests + clubs exist and are editable, but no recommendation engine)

---

### Section 6 — User Data Models [2 Marks]

#### Participant Details

| Field | Status | Evidence |
|---|---|---|
| First Name | ✅ | `firstName` in User schema |
| Last Name | ✅ | `lastName` |
| Email (unique) | ✅ | `email` with compound index |
| Participant Type | ✅ | `participanttype` (IIIT/Non-IIIT) |
| College / Org Name | ✅ | `collegename` |
| Contact Number | ✅ | `contactnumber` |
| Password (hashed) | ✅ | `password` with bcrypt |

#### Organizer Details

| Field | Status | Evidence |
|---|---|---|
| Organizer Name | ✅ | `organizername` |
| Category | ✅ | `category` |
| Description | ✅ | `description` |
| Contact Email | ✅ | `contactemail` |

**Score: 2 / 2** ✅

---

### Section 7 — Event Types [2 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Normal Event (Individual) | ✅ | `eventType: 'normal'` in Event schema |
| Merchandise Event (Individual) | ✅ | `eventType: 'merchandise'` with `MerchandiseSchema` |
| Mutual exclusivity enforced | ✅ | Backend prevents normal events having merchandise config and vice versa ([EventRoutes.js:16-21](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/EventRoutes.js#L16-L21)) |

**Score: 2 / 2** ✅

---

### Section 8 — Event Attributes [2 Marks]

| Attribute | Status |
|---|---|
| Event Name | ✅ |
| Event Description | ✅ |
| Event Type | ✅ |
| Eligibility | ✅ |
| Registration Deadline | ✅ |
| Event Start/End Date | ✅ |
| Registration Limit | ✅ |
| Registration Fee | ✅ |
| Organizer ID | ✅ |
| Event Tags | ✅ |
| Custom form (dynamic form builder) for Normal | ✅ |
| Merch: item details, variants, stock, purchase limit | ✅ |

**Score: 2 / 2** ✅

---

### Section 9 — Participant Features & Navigation [22 Marks]

#### 9.1 Navigation Menu [1 Mark]

| Expected Link | Status | Evidence |
|---|---|---|
| Dashboard | ✅ | `/participantdashboard` |
| Browse Events | ✅ | `/events` |
| Clubs/Organizers | ✅ | `/clubs` |
| Profile | ✅ | `/profile` |
| Logout | ✅ | `/logout` |

**Score: 1 / 1** ✅

#### 9.2 My Events Dashboard [6 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Upcoming Events section | ✅ | [participantdashboard.jsx:76-99](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/participantdashboard.jsx#L76-L99) |
| Essential details (name, type, organizer, schedule) | ⚠️ | Shows name, type, status, dates — but **organizer name** not displayed (only tags/category shown) |
| Participation History | ✅ | "Registered Events" section with filter |
| Category tabs: Normal, Merchandise, Completed | ✅ | Filter dropdown: All/Normal/Merchandise/Completed |
| "Cancelled/Rejected" tab | ❌ | No filter for cancelled/rejected events |
| Event records: name, type, organizer, status | ⚠️ | Name/type/status shown, but no organizer name, no team name |
| Clickable ticket ID | ⚠️ | "Get Ticket" button shows QR — but no clickable **Ticket ID text** itself |

> **Gaps**: Missing organizer name display, no Cancelled/Rejected filter, ticket ID not clickable text.

**Score: 4 / 6** (core functionality works — upcoming + history + category filters + QR tickets)

#### 9.3 Browse Events Page [5 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Partial match search | ✅ | `$regex` search on eventName and eventTags ([EventRoutes.js:212-213](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/EventRoutes.js#L212-L213)) |
| Fuzzy matching | ❌ | Only `$regex` — no fuzzy/approximate matching |
| Organizer name search | ❌ | Search only covers eventName and eventTags, not organizer name |
| Trending (Top 5/24h) | ❌ | Not implemented |
| Filter: Event Type | ✅ | [browseevents.jsx:99-103](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/browseevents.jsx#L99-L103) |
| Filter: Eligibility | ✅ | [browseevents.jsx:93-97](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/browseevents.jsx#L93-L97) |
| Filter: Date Range | ✅ | Start/end date filters ([browseevents.jsx:116-129](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/browseevents.jsx#L116-L129)) |
| Filter: Followed Clubs | ✅ | "Followed Only" filter ([browseevents.jsx:111-115](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/browseevents.jsx#L111-L115)) |
| Filter: All events | ✅ | Default view shows all published events |
| Filters work with search | ✅ | Filters applied on top of search results |

> **Gaps**: No fuzzy search, no search by organizer name, no trending feature.

**Score: 3 / 5** (partial search + 5 filters working, but missing fuzzy + trending)

#### 9.4 Event Details Page [2 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Complete details | ✅ | [participanteventview.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/participanteventview.jsx) shows all event info |
| Type indicated | ✅ | "(Merchandise Event)" label for merch, event type shown |
| Registration/Purchase button | ✅ | Register button present for both types |
| Deadline validation | ✅ | Backend checks `registrationDeadline < new Date()` ([RegRoute.js:172-174](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L172-L174)) |
| Registration limit / stock exhausted blocking | ✅ | Backend checks `registeredCount >= registrationLimit` and `itemsRemaining` ([RegRoute.js:201-203](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L201-L203)) |

**Score: 2 / 2** ✅

#### 9.5 Event Registration Workflows [5 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Normal: ticket sent via email on success | ✅ | `sendConfirmationEmail()` with QR attachment ([RegRoute.js:257-258](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L257-L258)) |
| Normal: ticket accessible in history | ✅ | "Get Ticket" button in dashboard |
| Merch: purchase implies registration | ✅ | Registration created with merchandise selection |
| Merch: stock decrement on purchase | ✅ | `itemsRemaining -= selectedVariants.length` ([RegRoute.js:222](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L222)) |
| Merch: QR ticket generated | ✅ | On approval, `sendConfirmationEmail` sends QR ([RegRoute.js:490](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L490)) |
| Merch: confirmation email sent | ✅ | Same email function |
| Merch: out-of-stock blocked | ✅ | `itemsRemaining` check ([RegRoute.js:217-220](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L217-L220)) |
| Tickets include event + participant details | ⚠️ | Email includes event name + ticket ID + QR. **Missing participant name** in ticket. |
| QR code + unique Ticket ID | ✅ | QR generated from `ticketID` (UUID) |

> **Gap**: Ticket email doesn't include participant name or full event details (dates, venue).

**Score: 4 / 5** (minor deduction for incomplete ticket content)

#### 9.6 Profile Page [2 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Editable: First Name | ✅ | `changeFirstName()` |
| Editable: Last Name | ✅ | `changeLastName()` |
| Editable: Contact Number | ✅ | `changeContactNumber()` |
| Editable: College/Org Name | ✅ | `changeCollege()` |
| Editable: Selected Interests | ✅ | `changeInterests()` |
| Editable: Followed Clubs | ⚠️ | Shown read-only with "visit Organizers page" message — **not directly editable from Profile** |
| Non-editable: Email | ✅ | Displayed but no edit button |
| Non-editable: Participant Type | ✅ | Displayed but no edit button |
| Password reset/change | ❌ | No password change mechanism for participants |

> **Gaps**: Followed clubs not editable from profile (only viewable); no participant password change.

**Score: 1.5 / 2** (most editable fields work, but missing password change and direct club management)

#### 9.7 Clubs/Organizers Listing Page [1 Mark]

| Requirement | Status | Evidence |
|---|---|---|
| List all approved organizers | ✅ | [clubs.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/clubs.jsx) — Name, Category, Description |
| Follow / Unfollow action | ✅ | Follow/Unfollow buttons with backend API |

**Score: 1 / 1** ✅

#### 9.8 Organizer Detail Page (Participant View) [1 Mark]

| Requirement | Status | Evidence |
|---|---|---|
| Info: Name, Category, Description, Contact Email | ⚠️ | Shows Name, Category, Description — **Contact Email not displayed** |
| Events: Upcoming / Past tabs | ✅ | "Upcoming" / "Past" filter buttons |

> **Gap**: Contact email not shown in [participantorganizerview.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/participantorganizerview.jsx).

**Score: 0.5 / 1** (functional but missing contact email display)

#### **Section 9 Total: 17 / 22**

---

### Section 10 — Organizer Features & Navigation [18 Marks]

#### 10.1 Navigation Menu [1 Mark]

| Expected Link | Rubric | Status | Actual |
|---|---|---|---|
| Dashboard | Dashboard | ✅ | `/organizerdashboard` |
| Create Event | Create Event | ✅ | `/createevent` |
| Profile | Profile | ✅ | `/profile` |
| Logout | Logout | ✅ | `/logout` |
| Ongoing Events | Ongoing Events | ❌ | Shows "Manage Events" (`/eventsorganized`) instead of "Ongoing Events" |

> **Gap**: Navbar says "Manage Events" instead of "Ongoing Events" as required by rubric.

**Score: 0.5 / 1** (all links present but wrong label for one)

#### 10.2 Organizer Dashboard [3 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Events displayed as cards | ✅ | [organizerdashboard.jsx:54-65](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/organizerdashboard.jsx#L54-L65) — cards with border |
| Shows Name, Type, Status | ✅ | eventName, eventType, eventStatus displayed |
| Link to detail/manage page | ✅ | "Manage Event" button links to `/editevent/:id` |
| "Events Carousel" presentation | ❌ | Listed as vertical cards, **not a carousel** |
| Event Analytics: registrations/sales/revenue/attendance of completed events | ✅ | [organizerdashboard.jsx:39-48](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/organizerdashboard.jsx#L39-L48) + `/getAggregateAnalytics` endpoint |

> **Gap**: Events are displayed as a vertical list, not as a "carousel" as rubric specifies.

**Score: 2 / 3** (analytics + event listing with links, but no carousel format)

#### 10.3 Event Detail Page (Organizer View) [4 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Overview: Name, Type, Status, Dates, Eligibility, Pricing | ✅ | [editEvents.jsx:291-403](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/editEvents.jsx#L291-L403) |
| Analytics: Registrations/Sales, Attendance, Revenue | ✅ | [editEvents.jsx:409-422](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/editEvents.jsx#L409-L422) |
| Analytics: Team completion | N/A | No team events implemented |
| Participants list (Name, Email, Reg Date, Payment, Attendance) | ✅ | [editEvents.jsx:433-488](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/editEvents.jsx#L433-L488) |
| Search/Filter participants | ❌ | No search or filter on participant list |
| Export CSV | ✅ | "Download Participants CSV" button ([editEvents.jsx:426-429](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/editEvents.jsx#L426-L429)) |

> **Gap**: No search/filter on participant list.

**Score: 3 / 4** (all major features except participant search/filter)

#### 10.4 Event Creation & Editing [4 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Create Draft flow | ✅ | [createevent.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/createevent.jsx) creates draft, redirects to edit |
| Define all required fields then publish | ✅ | Edit page allows setting all fields, changing status to Published |
| Draft: free edits | ✅ | `isFieldDisabled` returns false for all fields when draft |
| Published: only description, deadline, limit, close | ✅ | [EventRoutes.js:103-124](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/EventRoutes.js#L103-L124) |
| Ongoing/Completed: only status change | ✅ | [EventRoutes.js:125-127](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/EventRoutes.js#L125-L127) |
| Form Builder: text, dropdown, checkbox | ✅ | [dynamicformbuild.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/components/dynamicformbuild.jsx) |
| Form Builder: **file upload** field type | ❌ | Not in enum: `['text', 'number', 'email', 'dropdown', 'date', 'checkbox']` — no `file upload` |
| Form Builder: marking required/flexible | ✅ | Required checkbox per field |
| Form Builder: **reordering fields** | ✅ | ↑ Move Up / ↓ Move Down buttons ([dynamicformbuild.jsx:15-27](file:///media/ramanan/OS/Users/Ramaman/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/components/dynamicformbuild.jsx#L15-L27)) |
| Forms locked after first registration | ✅ | `isLocked` prop based on `registeredCount > 0` |

> **Gap**: No "file upload" field type in form builder.

**Score: 3 / 4** (reordering now implemented! Only file upload field type missing)

#### 10.5 Organizer Profile Page [4 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Editable: Name | ✅ | `changeOrganizerName()` |
| Editable: Category | ✅ | `changeCategory()` |
| Editable: Description | ✅ | `changeDescription()` |
| Editable: Contact Email | ✅ | `changeContactEmail()` |
| Editable: Contact Number | ❌ | No contact number field for organizers in schema or profile |
| Non-editable: Login email | ✅ | Email shown without edit button |
| Discord Webhook | ❌ | Not implemented anywhere |

> **Gaps**: No contact number for organizers; no Discord webhook integration.

**Score: 2 / 4** (basic profile editing works but missing contact number + Discord)

#### **Section 10 Total: 10.5 / 18**

---

### Section 11 — Admin Features & Navigation [6 Marks]

#### 11.1 Navigation Menu [1 Mark]

| Expected Link | Status | Actual |
|---|---|---|
| Dashboard | ✅ | `/admindashboard` |
| Manage Clubs/Organizers | ✅ | `/manageorganizers` |
| Password Reset Requests | ✅ | `/passwordreset` |
| Logout | ✅ | `/logout` |

**Score: 1 / 1** ✅

#### 11.2 Club/Organizer Management [5 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Add New Club/Organizer | ✅ | [manageorganizers.jsx:23-43](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/manageorganizers.jsx#L23-L43) |
| System auto-generates login email & password | ✅ | `generatePassword()` ([UserRoutes.js:75-82](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L75-L82)) + auto email generation ([UserRoutes.js:283-284](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L283-L284)) |
| Admin receives and shares credentials | ✅ | Credentials shown in alert + email sent via `sendCredentialsEmail()` ([UserRoutes.js:84-121](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L84-L121)) |
| New accounts can immediately log in | ✅ | Account created → ready to login |
| View list of all organizers | ✅ | `/getOrganizers` endpoint |
| Remove/disable accounts | ✅ | Archive + delete buttons |
| Option to archive or permanently delete | ✅ | Separate archive/unarchive + delete buttons |
| Removed clubs cannot log in | ✅ | Login checks `user.status === 'archived'` ([UserRoutes.js:144-146](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L144-L146)) |

**Score: 5 / 5** ✅

#### **Section 11 Total: 6 / 6** ✅

---

### Section 12 — Deployment [5 Marks]

| Requirement | Status |
|---|---|
| Frontend deployed (Vercel/Netlify) | ❌ |
| Backend deployed (Render/Railway/etc.) | ❌ |
| MongoDB Atlas | ❌ (using local MongoDB URI) |
| `deployment.txt` with URLs | ❌ Not found |

**Score: 0 / 5**

---

## Part 1 Summary

| Section | Max | Awarded |
|---|---|---|
| 4. Auth & Security | 8 | **8** |
| 5. Onboarding & Preferences | 3 | **2** |
| 6. User Data Models | 2 | **2** |
| 7. Event Types | 2 | **2** |
| 8. Event Attributes | 2 | **2** |
| 9. Participant Features | 22 | **17** |
| 10. Organizer Features | 18 | **10.5** |
| 11. Admin Features | 6 | **6** |
| 12. Deployment | 5 | **0** |
| **Total Part 1** | **70** | **49.5** |

---

## Part 2: Advanced Features [30 Marks]

> Requirements: Tier A ×2 (16), Tier B ×2 (12), Tier C ×1 (2) = 30 marks

### Tier A — Core Advanced Features [Choose 2 — 8 marks each]

#### ✅ Merchandise Payment Approval Workflow [8 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Payment proof upload (image) | ✅ | multer + `paymentProof: Buffer` ([RegRoute.js:16-30](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L16-L30)) |
| Order enters Pending Approval state | ✅ | `status: 'Pending'` for merchandise ([RegRoute.js:242](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L242)) |
| Organizer views orders with proofs + status | ✅ | `getEventRegistrations` + `getPaymentProof` endpoints |
| Actions: Approve / Reject | ✅ | `/approveMerchandiseOrder` + `/rejectMerchandiseOrder` |
| Approval → Successful, stock decrement, QR, email | ✅ | Approve sets `Approved` + sends confirmation email with QR |
| No QR in pending/rejected state | ✅ | `getRegistrationTicket` checks `status !== 'Approved'` ([RegRoute.js:325-326](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L325-L326)) |
| Rejection restores stock | ✅ | `itemsRemaining += selection.length` ([RegRoute.js:523-526](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L523-L526)) |
| Rejection email sent | ✅ | `sendRejectionEmail()` called on rejection |

**Score: 8 / 8** ✅

#### ✅ QR Scanner & Attendance Tracking [8 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Built-in QR scanner (camera) | ✅ | `Html5QrcodeScanner` in [editEvents.jsx:156](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/editEvents.jsx#L156) |
| Mark attendance with timestamp | ✅ | `hasattended = true`, `attendanceTimestamps = new Date()` ([RegRoute.js:567-568](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L567-L568)) |
| Reject duplicate scans | ✅ | `registration.hasattended` check ([RegRoute.js:563-564](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L563-L564)) |
| Live attendance dashboard | ✅ | [editEvents.jsx:490-512](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/editEvents.jsx#L490-L512): scanned vs not-scanned with color coding |
| Export attendance reports (CSV) | ✅ | CSV export includes attendance column |
| Manual override option | ❌ | No manual attendance marking UI (only QR scan) |
| Audit logging | ❌ | No audit log for attendance changes |
| Validates ticket belongs to correct event | ✅ | `registration.eventId.toString() !== eventId` check ([RegRoute.js:554-556](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/RegRoute.js#L554-L556)) |

> **Gaps**: No manual override option for attendance; no audit logging.

**Score: 6 / 8**

#### ❌ Hackathon Team Registration — Not implemented

### Tier A Total: 14 / 16

---

### Tier B — Real-time & Communication Features [Choose 2 — 6 marks each]

#### ✅ Organizer Password Reset Workflow [6 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| Organizer can request reset | ✅ | [organizerpasswordreset.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/organizerpasswordreset.jsx) + `/organizerPasswordResetRequest` |
| Admin views all requests with details | ✅ | [adminpasswordreset.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/adminpasswordreset.jsx) + `/getPasswordResetRequests` |
| Details: club name, date, reason | ✅ | `organizerName`, `createdAt`, `reason` displayed |
| Approve/reject with comments | ✅ | `/handlePasswordResetRequest` with `comment` field |
| Auto-generate new password on approval | ✅ | Random password generated ([UserRoutes.js:517](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L517)) |
| Admin receives password to share | ⚠️ | Password is sent **via email to organizer directly**, not shown to admin first |
| Status tracking (Pending/Approved/Rejected) | ✅ | `status` field in OrganizerPasswordReset model |
| Password reset history | ✅ | All requests shown (sorted by date) |

> **Minor gap**: Password goes directly to organizer via email rather than admin receiving it first.

**Score: 5 / 6**

#### ❌ Real-Time Discussion Forum — Not implemented
#### ❌ Team Chat — Not implemented

> **Problem**: Only 1 Tier B feature implemented. Rubric requires **2** from Tier B.

### Tier B Total: 5 / 12 (only 1 of 2 required features done)

---

### Tier C — Integration & Enhancement Features [Choose 1 — 2 marks each]

#### ✅ Bot Protection (CAPTCHA) [2 Marks]

| Requirement | Status | Evidence |
|---|---|---|
| CAPTCHA on login page | ✅ | [login.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/login.jsx) — reCAPTCHA integration |
| CAPTCHA on registration page | ✅ | [register.jsx](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/frontend/src/pages/register.jsx) — reCAPTCHA integration |
| Backend verification | ✅ | `verifyCaptcha()` with Google reCAPTCHA API ([UserRoutes.js:61-73](file:///media/ramanan/OS/Users/Ramanan/Documents/Sem4/DASS/DASS%20Assignmenr/2024113019/backend/routes/UserRoutes.js#L61-L73)) |

**Score: 2 / 2** ✅

#### ❌ Anonymous Feedback System — Not implemented
#### ❌ Add to Calendar Integration — Not implemented

### Tier C Total: 2 / 2

---

## Part 2 Summary

| Tier | Requirement | Max | Awarded |
|---|---|---|---|
| A | Merch Payment Approval + QR Scanner (2 of 3) | 16 | **14** |
| B | Password Reset only (1 of 2 required) | 12 | **5** |
| C | CAPTCHA (1 of 1 required) | 2 | **2** |
| **Total Part 2** | | **30** | **21** |

---

## Additional Deductions

| Item | Status |
|---|---|
| Root-level `README.md` | ❌ Missing |
| `deployment.txt` | ❌ Missing |
| CORS middleware | ❌ Not set up in server.js (may cause issues) |

> The rubric mentions README must document libraries, advanced features, setup instructions. Missing README likely incurs additional penalty depending on grading policy.

---

## Final Score

| Part | Max | Awarded |
|---|---|---|
| Part 1: Core System | 70 | **49.5** |
| Part 2: Advanced Features | 30 | **21** |
| **Total** | **100** | **70.5** |

---

## Key Gaps to Fix for Maximum Score

| Priority | Item | Marks at Stake |
|---|---|---|
| 🔴 Critical | **Deploy** frontend + backend + add `deployment.txt` | **5** |
| 🔴 Critical | **Implement 2nd Tier B feature** (e.g., Real-Time Discussion Forum or implement quick team chat placeholder) | **6** |
| 🟡 High | Add **README.md** with library justifications, advanced features list, setup instructions | Potential penalty |
| 🟡 High | Add **fuzzy search** (e.g., `fuse.js`) + **organizer name search** + **trending** (top 5 by registrations in 24h) | **~2** |
| 🟡 High | Add **Discord webhook** integration on organizer profile | **~2** |
| 🟡 High | Add **contact number** field for organizers | **~0.5** |
| 🟠 Medium | Add **"file upload" field type** in form builder | **~1** |
| 🟠 Medium | Add **participant password change** on profile | **~0.5** |
| 🟠 Medium | Add **manual attendance override** + audit logging for QR scanner | **~2** |
| 🟠 Medium | Display **organizer name** on participant dashboard events | **~0.5** |
| 🟠 Medium | Make organizer dashboard events a **carousel** | **~1** |
| 🟢 Low | Show **contact email** on organizer detail page (participant view) | **~0.5** |
| 🟢 Low | Add **Cancelled/Rejected** filter tab in participant dashboard | **~0.5** |
| 🟢 Low | Change navbar label from "Manage Events" → "Ongoing Events" for organizers | **~0.5** |
| 🟢 Low | Include **participant name** in ticket emails | **~0.5** |
| 🟢 Low | Add interest-based **event recommendations** | **~1** |
