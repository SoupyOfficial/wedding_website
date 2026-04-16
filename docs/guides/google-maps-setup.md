# Google Maps Travel Time Checker — Setup Guide

The travel page has an interactive **Travel Time Checker** widget that lets guests enter their address (or pick a preset destination) and see driving directions + estimated travel time to the venue via Google Maps. It's currently **disabled** and will activate automatically once you set two environment variables.

---

## Step 1: Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
   - Click the project dropdown at the top → **New Project**
   - Name it something like `wedding-website` → **Create**
3. Enable the **Maps Embed API**:
   - Go to **APIs & Services → Library**
   - Search for **"Maps Embed API"**
   - Click it → **Enable**
   - _This is the only API you need. The Embed API is free with no usage limits._
4. Create an API key:
   - Go to **APIs & Services → Credentials**
   - Click **+ Create Credentials → API Key**
   - Copy the key (it looks like `AIzaSy...`)

## Step 2: Restrict the API Key (Recommended)

To prevent misuse, restrict the key:

1. In **APIs & Services → Credentials**, click your new API key
2. Under **Application restrictions**, select **HTTP referrers (websites)**
3. Add your allowed referrers:
   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   http://localhost:3000/*
   ```
4. Under **API restrictions**, select **Restrict key** and choose only **Maps Embed API**
5. Click **Save**

## Step 3: Set Environment Variables

Add these two variables to your `.env` (or your hosting platform's environment settings):

```env
# Google Maps — Travel Time Checker widget
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."
NEXT_PUBLIC_VENUE_ADDRESS="123 Venue Street, Apopka, FL 32703"
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key from Step 1 |
| `NEXT_PUBLIC_VENUE_ADDRESS` | Full street address of the wedding venue. Google Maps uses this as the destination for all directions. Use the most complete address possible for accuracy. |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. This is expected — the Maps Embed API key is designed to be used client-side and is protected by your HTTP referrer restrictions (Step 2).

## Step 4: Enable the Widget in Code

Open `app/(public)/travel/page.tsx` and make two changes:

**1. Uncomment the import** (near the top of the file):
```tsx
// Change this:
// import TravelTimeChecker from "@/components/TravelTimeChecker";

// To this:
import TravelTimeChecker from "@/components/TravelTimeChecker";
```

**2. Restore the Travel Time Checker section** (after the Orlando Traffic Tips section):

Replace the disabled comment block with:
```tsx
{/* Travel Time Checker */}
<div className="max-w-5xl mx-auto mb-16">
  <h2 className="heading-gold text-3xl text-center mb-4">
    📍 Check Your Travel Time
  </h2>
  <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
    Enter your hotel, Airbnb, or starting address below to see estimated
    driving time to the venue — or tap a popular location for a quick check.
  </p>
  <TravelTimeChecker />
</div>

<SectionDivider />
```

## Step 5: Deploy

Restart your dev server (`npm run dev`) or redeploy. The widget will appear on the travel page with:

- 🗺️ **Embedded Google Map** showing the venue location
- 📝 **Address input** — guests type their hotel/Airbnb address
- ⚡ **Preset destinations** — quick-check buttons for MCO airport, Disney, Downtown Orlando, etc.
- ⚠️ **Traffic warnings** — contextual alerts for high-congestion areas (I-4, International Drive, etc.)
- 🔗 **"Open in Google Maps"** link for full turn-by-turn navigation

---

## How It Works

The component (`components/TravelTimeChecker.tsx`) uses the **Google Maps Embed API** in two modes:

- **Place mode** (default): Shows venue location on the map
- **Directions mode** (after address entry): Shows driving route with estimated travel time

Preset destinations and traffic warnings are configured in `lib/config/travel-content.ts` (`keyDestinations` array). To add or modify destinations, edit that file.

## Graceful Degradation

If the environment variables are not set, the `TravelTimeChecker` component returns `null` — nothing renders and the page works normally without it. The traffic tips section (static content) always shows regardless.

## Cost

The **Maps Embed API is free** — Google does not charge for embed requests and there are no quotas. You will not be billed for this usage. No billing account is technically required, but Google may prompt you to add one during project setup.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map doesn't appear | Check that both env vars are set and the dev server was restarted |
| "This page can't load Google Maps correctly" | API key is invalid or Maps Embed API isn't enabled |
| Map loads but directions don't work | Verify `NEXT_PUBLIC_VENUE_ADDRESS` is a valid, complete address |
| Console error about referrer | Add your domain to the API key's HTTP referrer restrictions |
| Works locally but not in production | Add your production domain to the referrer allowlist |
