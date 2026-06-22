# Admin Guide

This guide is for the couple managing the wedding website. No technical knowledge is needed.

## Logging in

Go to `https://forevercampbells.com/admin/login` and enter the admin email and password. You'll be taken to the dashboard.

---

## Dashboard

The dashboard shows at a glance:
- How many guests have been invited, how many have RSVPed (attending / declining / not yet responded)
- How many days until the wedding
- Items that need your attention: photos awaiting approval, unread messages, pending guest book entries, song requests to review

---

## Managing guests

Go to **Guests** in the sidebar.

**Adding a guest:**
Click "Add Guest" and fill in their name. Optional fields: email, phone, table number, group (e.g. "Bride's Family"), whether they're allowed a plus-one, internal notes.

**Editing a guest:**
Click the guest's name to open their record. You can update any field, including manually setting their RSVP status if they responded by phone.

**Tracking RSVPs:**
The guest list can be filtered by RSVP status (Pending / Attending / Declined). Each guest shows their meal preference and dietary needs once they've responded.

**Allowing a plus-one:**
Check "Plus One Allowed" on the guest's record. When that guest RSVPs, they'll see an option to add their plus-one's name and meal preference.

---

## Settings

Go to **Settings** in the sidebar to configure everything about the site.

**Key things to set before the wedding:**
- Couple name (shown in the hero and page titles)
- Wedding date and time
- Venue name and address
- Hero tagline (the subtitle shown on the home page)
- Contact emails (joint, bride, groom)
- RSVP deadline (guests can't submit after this date)
- Notification email (where you'll receive an email when a guest RSVPs, if enabled)

**After the wedding:**
- Post-wedding content: set a thank-you message that appears on the home page
- Post-wedding hero tagline: swap the countdown for a "Thank you for celebrating" message
- You can disable pages like RSVP and Music via the **Features** page

**Site password:**
Enable the site password to require guests to enter a password before viewing any page. Useful for keeping the site private before you're ready to share it. The password is stored securely (encrypted).

**Announcement banner:**
Enter text and optionally a link URL. Toggle "Active" to show the banner at the top of every page. Pick a background color with the color picker. Great for last-minute announcements ("Parking is now open at the north lot").

---

## Feature flags

Go to **Features** in the sidebar.

Each toggle enables or disables a page or feature instantly, without needing to update the website code. Useful for:

- **Before the wedding:** Turn off the Guest Book and Photo Upload until after the ceremony
- **After the wedding:** Turn off RSVP, Music Requests, and Registry. Turn on Guest Book and Photo Upload
- **Temporarily:** Disable a page if something needs fixing, then re-enable it

| Toggle | What it controls |
|--------|-----------------|
| RSVP | The RSVP page and form |
| Guest Book | The guest book page and submission form |
| Photo Upload | The "Upload a Photo" button on the gallery |
| Song Requests | The song request form on the Music page |
| Music page | The entire Music & Requests page |
| Entertainment page | The Entertainment page |
| Our Story page | The Our Story timeline page |
| Event Details page | The Event Details page |
| Travel & Stay page | The Travel & Stay page |
| Wedding Party page | The Wedding Party page |
| Gallery page | The Gallery page |
| Registry page | The Registry page |
| FAQ page | The FAQ page |
| Contact page | The Contact page |
| Photos of Us page | The personal couple photos page |
| Timeline | The timeline component within Our Story |

---

## Managing content

### Our Story (`/our-story`)

Go to **Content → Timeline**.

Add events in the order you want them displayed (set the Sort Order). Each event has:
- Title
- Date/time display text (freeform, e.g. "Summer 2019" or "June 14, 2021")
- Description
- Icon (emoji)
- Event type: Pre-wedding, Wedding Day, or Post-wedding

### FAQs (`/faq`)

Go to **FAQs**.

Add questions and answers. Toggle "Visible" to show or hide individual FAQs without deleting them. Sort order controls display order.

### Wedding Party (`/wedding-party`)

Go to **Wedding Party**.

Each member has:
- Name, role (e.g. "Maid of Honor"), side (bride or groom)
- Relationship to the couple
- Bio and photo
- Sort order (controls display order within their group)
- **Confirmed** toggle — uncheck this to temporarily hide a member without deleting them. The "Hide unconfirmed wedding party members" setting in Settings controls whether guests see them.

### Hotels (`/travel`)

Go to **Hotels**.

Add hotel recommendations that appear on the Travel & Stay page. Fill in the name, address, booking link, and optionally a group block code and deadline. Sort order controls the display order.

### Entertainment

Go to **Entertainment**.

Add entertainment lineup items (bands, DJs, performers, activities). Each has a name, icon, description, visibility toggle, and sort order.

### Registry

Go to **Registry**.

Three item types:
- **Store** — a link to a registry store (e.g. Target, Amazon)
- **Product** — a specific item at a specific price
- **Fund** — a cash fund with a goal amount (shows a progress bar as contributions come in)

For funds, contributions recorded at `/api/v1/registry/contribute` automatically update the "raised" amount. You can view all contributions per item.

---

## Photos

Go to **Photos**.

**Approving guest uploads:**
When guests upload photos (if that feature is enabled), they appear here with "Pending" status. Click to preview, then approve or reject. Approved photos appear in the gallery.

**Managing the gallery:**
- Add captions to photos
- Assign tags (create tags first under Tags)
- Set sort order
- Delete photos

**Tags:**
Tags appear as filter buttons on the gallery page. Create tags with a name, type (event, person, date, location, or custom), and a color. Assign one or more tags to each photo.

---

## Music & DJ

Go to **Music & DJ**.

**Song requests:**
Guests submit song requests through the Music page. Requests appear here for review. Approve or reject them — only approved, visible songs show on the public music page.

**DJ list:**
Build a list of must-play songs and do-not-play songs for your DJ. Songs can be tagged with a time slot (Ceremony, Cocktail Hour, First Dance, Reception, Last Dance). The DJ can view these lists from the public music page.

**Apple Music import:**
If your Apple Music credentials are configured, paste an Apple Music playlist URL to import all songs from that playlist directly into the Must-Play list.

---

## Guest book

Go to **Guest Book**.

After the wedding, guests can leave messages. Each submission requires approval. Review messages here and approve the ones you want shown publicly.

---

## Communications

Go to **Communications**.

All messages submitted via the Contact page appear here. Mark them as read once you've handled them. There is no in-site reply button — you'll need to respond via your email client.

---

## Post-wedding checklist

1. **Settings** → Set the post-wedding hero tagline and post-wedding content block
2. **Features** → Disable: RSVP, Song Requests
3. **Features** → Enable: Guest Book, Photo Upload
4. **Photos** → Approve guest-uploaded photos as they come in
5. **Guest Book** → Approve messages as they come in
6. If you have a shared photo album URL (Google Photos, Dropbox, etc.) → **Settings** → Shared Photo Album URL
