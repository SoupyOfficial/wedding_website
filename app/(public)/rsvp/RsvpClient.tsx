"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader, Alert } from "@/components/ui";
import { formatEasternDate } from "@/lib/timezone";

type Step = "lookup" | "details" | "songs" | "confirm" | "done" | "locked";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  dietaryNeeds: string | null;
  isVegetarian: boolean;
  plusOneName: string | null;
  plusOneAllowed: boolean;
  plusOneAttending: boolean | null;
  rsvpRespondedAt: string | null;
  songRequest: string | null;
  danceSong: string | null;
  firstDanceSong: string | null;
}

export default function RsvpClient({
  rsvpDeadline,
  rsvpEditDeadlineIso,
  rafflePrize,
  dressCode,
  dressCodePinterestLink,
  prefillName,
}: {
  rsvpDeadline: string | null;
  rsvpEditDeadlineIso: string | null;
  rafflePrize: string;
  dressCode: string | null;
  dressCodePinterestLink: string | null;
  prefillName?: string;
}) {
  const [step, setStep] = useState<Step>("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState<GuestData | null>(null);

  // Form states
  const [lookupFirstName, setLookupFirstName] = useState("");
  const [lookupLastName, setLookupLastName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [bringingPlusOne, setBringingPlusOne] = useState<boolean | null>(null);
  const [songRequest, setSongRequest] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [danceSong, setDanceSong] = useState("");
  const [firstDanceSong, setFirstDanceSong] = useState("");
  const [isFirstRsvp, setIsFirstRsvp] = useState(false);

  async function performLookup(firstName: string, lastName: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/v1/rsvp/lookup?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`
      );
      const data = await res.json();

      if (!res.ok || !data.data?.guest) {
        if (res.ok || res.status === 404) {
          setError(
            "We couldn't find your name on our guest list. Please make sure you've typed your full first and last name exactly as it appears on your invitation. If you're still having trouble, please contact Jacob & Ashley."
          );
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setGuest(data.data.guest);
      setAttending(
        data.data.guest.rsvpStatus === "attending"
          ? true
          : data.data.guest.rsvpStatus === "declined"
          ? false
          : null
      );
      setEmail(data.data.guest.email || "");
      setPhone(data.data.guest.phone || "");
      setDietaryNotes(data.data.guest.dietaryNeeds || "");
      setIsVegetarian(!!data.data.guest.isVegetarian);
      setPlusOneName(data.data.guest.plusOneName || "");
      setBringingPlusOne(data.data.guest.plusOneAttending ?? null);
      setSongRequest(data.data.guest.songRequest || "");
      setDanceSong(data.data.guest.danceSong || "");
      setFirstDanceSong(data.data.guest.firstDanceSong || "");

      const responded = !!data.data.guest.rsvpRespondedAt;
      const editDeadlinePassed = !!rsvpEditDeadlineIso && new Date(rsvpEditDeadlineIso).getTime() <= Date.now();
      if (responded && editDeadlinePassed) {
        setStep("locked");
      } else {
        setStep("details");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    await performLookup(lookupFirstName, lookupLastName);
  }

  const prefillDone = useRef(false);

  useEffect(() => {
    if (prefillName && !prefillDone.current) {
      prefillDone.current = true;
      const trimmed = prefillName.trim();
      const spaceIdx = trimmed.indexOf(" ");
      if (spaceIdx > 0) {
        const first = trimmed.slice(0, spaceIdx);
        const last = trimmed.slice(spaceIdx + 1).trim();
        setLookupFirstName(first);
        setLookupLastName(last);
        performLookup(first, last);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillName]);

  async function handleSubmit() {
    if (!guest) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/rsvp/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          attending,
          email,
          phone,
          dietaryNotes,
          isVegetarian: attending ? isVegetarian : undefined,
          plusOneName: guest.plusOneAllowed && bringingPlusOne ? plusOneName : undefined,
          bringingPlusOne: guest.plusOneAllowed ? bringingPlusOne : undefined,
          songRequest: songRequest || undefined,
          songArtist: songArtist || undefined,
          danceSong: danceSong || undefined,
          firstDanceSong: firstDanceSong || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit RSVP.");
        return;
      }

      setIsFirstRsvp(data.data?.isFirstRsvp || false);
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader title="RSVP" subtitle="We can't wait to celebrate with you!" />

        {/* RSVP Deadline */}
        {rsvpDeadline && (
          <div className="text-center mb-6">
            <p className="text-ivory/60 text-sm">
              Please respond by{" "}
              <span className="text-gold font-semibold">
                {rsvpDeadline ? formatEasternDate(rsvpDeadline.slice(0, 10)) : null}
              </span>
            </p>
            {rafflePrize && rafflePrize !== "-1" ? (
              <p className="text-gold/70 text-sm mt-1 italic">
                Every RSVP earns one raffle entry — you could win: {rafflePrize}
              </p>
            ) : (
              <p className="text-gold/70 text-sm mt-1 italic">
                Every RSVP earns one raffle entry — details coming soon!
              </p>
            )}
          </div>
        )}

        {/* Progress Steps */}
        {step !== "done" && step !== "locked" && (
          <div className="flex justify-center items-center gap-2 mb-12 max-w-md mx-auto">
            {(["lookup", "details", "songs", "confirm"] as Step[]).map(
              (s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step === s
                        ? "bg-gold text-midnight"
                        : (["lookup", "details", "songs", "confirm"] as Step[]).indexOf(step) > i
                        ? "bg-gold/30 text-gold"
                        : "bg-royal/50 text-ivory/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 3 && (
                    <div className="w-6 h-px bg-gold/20" />
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <Alert type="error" message={error} className="text-center" />
          </div>
        )}

        {/* Dress Code */}
        {dressCode && (
          <div className="max-w-md mx-auto mb-6">
            <div className="card-celestial animate-fade-in-up">
              <h2 className="heading-gold text-center mb-2">
                👗 Dress Code
              </h2>
              <p className="text-ivory/70 text-sm text-center leading-relaxed">
                {dressCode}
              </p>
              {dressCodePinterestLink && (
                <p className="text-center mt-3">
                  <a
                    href={dressCodePinterestLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold/70 hover:text-gold underline underline-offset-2 text-sm transition-colors"
                  >
                    View inspiration on Pinterest →
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Lookup */}
        {step === "lookup" && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-6">
                Find Your Invitation
              </h2>
              <form onSubmit={handleLookup}>
                <div className="mb-4">
                  <label htmlFor="rsvp-lookup-first" className="block text-ivory/70 text-sm mb-2">
                    First Name
                  </label>
                  <input
                    id="rsvp-lookup-first"
                    type="text"
                    value={lookupFirstName}
                    onChange={(e) => setLookupFirstName(e.target.value)}
                    placeholder="First Name"
                    className="input-celestial w-full"
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="rsvp-lookup-last" className="block text-ivory/70 text-sm mb-2">
                    Last Name
                  </label>
                  <input
                    id="rsvp-lookup-last"
                    type="text"
                    value={lookupLastName}
                    onChange={(e) => setLookupLastName(e.target.value)}
                    placeholder="Last Name"
                    className="input-celestial w-full"
                    autoComplete="family-name"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !lookupFirstName.trim() || !lookupLastName.trim()}
                  className="btn-gold w-full py-3 disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Find My Invitation"}
                </button>
              </form>
              <p className="text-center text-ivory/40 text-xs mt-4">
                Visit{" "}
                <a
                  href={process.env.NEXT_PUBLIC_SITE_URL || "https://forevercampbells.com"}
                  className="text-gold/60 hover:text-gold underline underline-offset-2"
                >
                  forevercampbells.com
                </a>{" "}
                for event details, travel info, and our registry.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Attendance Details */}
        {step === "details" && guest && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-2">
                Welcome, {guest.firstName}!
              </h2>
              {guest.rsvpRespondedAt && (
                <p className="text-center text-gold/60 text-sm mb-4">
                  (Updating your previous RSVP)
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="rsvp-attending" className="block text-ivory/70 text-sm mb-2">
                    Will you be attending?
                  </label>
                  <div id="rsvp-attending" className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending(true)}
                      className={`flex-1 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                        attending === true
                          ? "bg-gold/20 border-gold text-gold"
                          : "border-gold/20 text-ivory/50 hover:border-gold/40"
                      }`}
                    >
                      Joyfully Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttending(false)}
                      className={`flex-1 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                        attending === false
                          ? "bg-red-900/20 border-red-500/50 text-red-300"
                          : "border-gold/20 text-ivory/50 hover:border-gold/40"
                      }`}
                    >
                      Regretfully Decline
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="rsvp-email" className="block text-ivory/70 text-sm mb-2">
                    Email (optional)
                  </label>
                  <input
                    id="rsvp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="rsvp-phone" className="block text-ivory/70 text-sm mb-2">
                    Phone (optional)
                  </label>
                  <input
                    id="rsvp-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="(555) 123-4567"
                    autoComplete="tel"
                  />
                </div>

                {guest.plusOneAllowed && (
                  <div>
                    <label className="block text-ivory/70 text-sm mb-2">
                      Are you bringing a plus one?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setBringingPlusOne(true); setPlusOneName(plusOneName || ""); }}
                        className={`flex-1 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                          bringingPlusOne === true
                            ? "bg-gold/20 border-gold text-gold"
                            : "border-gold/20 text-ivory/50 hover:border-gold/40"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBringingPlusOne(false); setPlusOneName(""); }}
                        className={`flex-1 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                          bringingPlusOne === false
                            ? "bg-gold/20 border-gold text-gold"
                            : "border-gold/20 text-ivory/50 hover:border-gold/40"
                        }`}
                      >
                        No
                      </button>
                    </div>
                    {bringingPlusOne && (
                      <div className="mt-3">
                        <label htmlFor="rsvp-plusone" className="block text-ivory/70 text-sm mb-2">
                          Plus One Name
                        </label>
                        <input
                          id="rsvp-plusone"
                          type="text"
                          value={plusOneName}
                          onChange={(e) => setPlusOneName(e.target.value)}
                          className="input-celestial w-full"
                          placeholder="Guest name"
                          autoComplete="name"
                        />
                      </div>
                    )}
                  </div>
                )}

                <p className="text-ivory/40 text-xs italic">
                  Plus ones are by invite only. All those invited will be addressed by name on your invitation.
                </p>

                {attending && (
                  <div>
                    <label htmlFor="rsvp-dietary" className="block text-ivory/70 text-sm mb-2">
                      Dietary Restrictions / Allergies
                    </label>
                    <textarea
                      id="rsvp-dietary"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      className="input-celestial w-full h-20 resize-none"
                      placeholder="Any allergies or dietary needs..."
                    />
                    <p className="text-ivory/40 text-xs italic mt-2">
                      Dinner will be served buffet-style. Please let us know about any allergies or dietary restrictions.
                    </p>
                    <label className="flex items-start gap-3 mt-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVegetarian}
                        onChange={(e) => setIsVegetarian(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-gold"
                      />
                      <span className="text-ivory/70 text-sm">
                        🌱 Vegetarian meal (optional)
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("lookup")}
                    className="btn-outline flex-1 py-3"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (attending === null) {
                        setError("Please select your attendance.");
                        return;
                      }
                      setError("");
                      if (attending === false) {
                        setStep("confirm");
                      } else {
                        setStep("songs");
                      }
                    }}
                    className="btn-gold flex-1 py-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Song Requests */}
        {step === "songs" && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-2">
                Song Requests
              </h2>
              <p className="text-center text-ivory/50 text-sm mb-6">
                Help us build the perfect playlist!
              </p>

              <div className="space-y-4 mb-6">
                <h3 className="text-gold font-serif text-lg text-center">
                  Request a Song
                </h3>
                <p className="text-ivory/50 text-sm text-center -mt-2 mb-4">
                  Any song you&apos;d love to hear — we&apos;ll do our best to play it!
                </p>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="e.g. September"
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="e.g. Earth, Wind & Fire"
                  />
                </div>
              </div>

              <div className="border-t border-gold/10 pt-4 mb-6">
                <h3 className="text-gold font-serif text-lg text-center mb-4">
                  Dance Floor Favorites
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-ivory/70 text-sm mb-2">
                      What song will get you on the dance floor?
                    </label>
                    <input
                      type="text"
                      value={danceSong}
                      onChange={(e) => setDanceSong(e.target.value)}
                      className="input-celestial w-full"
                      placeholder="Song title & artist"
                    />
                  </div>
                  <div>
                    <label className="block text-ivory/70 text-sm mb-2">
                      What was your first dance song?
                    </label>
                    <input
                      type="text"
                      value={firstDanceSong}
                      onChange={(e) => setFirstDanceSong(e.target.value)}
                      className="input-celestial w-full"
                      placeholder="Song title & artist"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="btn-outline flex-1 py-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  className="btn-gold flex-1 py-3"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === "confirm" && guest && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-6">
                Review Your RSVP
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-ivory/50">Name</span>
                  <span className="text-ivory">
                    {guest.firstName} {guest.lastName}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-ivory/50">Attending</span>
                  <span className={attending ? "text-green-400" : "text-red-400"}>
                    {attending ? "Yes" : "No"}
                  </span>
                </div>
                {attending && dietaryNotes && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Dietary Notes</span>
                    <span className="text-ivory text-right max-w-[200px]">
                      {dietaryNotes}
                    </span>
                  </div>
                )}
                {attending && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Meal Preference</span>
                    <span className="text-ivory">
                      {isVegetarian ? "Vegetarian" : "No preference"}
                    </span>
                  </div>
                )}
                {attending && guest.plusOneAllowed && plusOneName && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Plus One</span>
                    <span className="text-ivory">{plusOneName}</span>
                  </div>
                )}
                {attending && songRequest && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Song</span>
                    <span className="text-ivory text-right">
                      {songRequest}
                      {songArtist && ` – ${songArtist}`}
                    </span>
                  </div>
                )}
                {attending && danceSong && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Dance Floor Song</span>
                    <span className="text-ivory text-right">{danceSong}</span>
                  </div>
                )}
                {attending && firstDanceSong && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">First Dance Song</span>
                    <span className="text-ivory text-right">{firstDanceSong}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setStep(attending ? "songs" : "details")
                  }
                  className="btn-outline flex-1 py-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-gold flex-1 py-3 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit RSVP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Locked — RSVP edit window has closed */}
        {step === "locked" && guest && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-2">
                Your RSVP
              </h2>
              <p className="text-center text-gold/60 text-sm mb-6">
                {guest.firstName} {guest.lastName}
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-gold/10">
                  <span className="text-ivory/50">Status</span>
                  <span className={guest.rsvpStatus === "attending" ? "text-green-400" : "text-red-400"}>
                    {guest.rsvpStatus === "attending" ? "Joyfully Attending" : "Regretfully Declined"}
                  </span>
                </div>
                {guest.rsvpStatus === "attending" && guest.dietaryNeeds && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Dietary Notes</span>
                    <span className="text-ivory text-right max-w-[200px]">
                      {guest.dietaryNeeds}
                    </span>
                  </div>
                )}
                {guest.rsvpStatus === "attending" && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Meal Preference</span>
                    <span className="text-ivory">
                      {guest.isVegetarian ? "Vegetarian" : "No preference"}
                    </span>
                  </div>
                )}
                {guest.rsvpStatus === "attending" && guest.plusOneAllowed && guest.plusOneName && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Plus One</span>
                    <span className="text-ivory">{guest.plusOneName}</span>
                  </div>
                )}
                {guest.rsvpStatus === "attending" && guest.songRequest && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Song</span>
                    <span className="text-ivory text-right">{guest.songRequest}</span>
                  </div>
                )}
                {guest.rsvpStatus === "attending" && guest.danceSong && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Dance Floor Song</span>
                    <span className="text-ivory text-right">{guest.danceSong}</span>
                  </div>
                )}
                {guest.rsvpStatus === "attending" && guest.firstDanceSong && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">First Dance Song</span>
                    <span className="text-ivory text-right">{guest.firstDanceSong}</span>
                  </div>
                )}
              </div>

              <div className="text-center mb-6">
                <p className="text-ivory/60 text-sm">
                  The RSVP edit window has closed. Please contact Jacob &amp; Ashley if you need to make changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGuest(null);
                  setStep("lookup");
                  setError("");
                }}
                className="btn-outline w-full py-3"
              >
                Look Up a Different Name
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div className="max-w-md mx-auto text-center animate-fade-in-up">
            <div className="card-celestial">
              <div className="text-6xl mb-4">🌙</div>
              <h2 className="text-gold font-serif text-2xl mb-4">
                {attending
                  ? "Thank You!"
                  : "We'll Miss You!"}
              </h2>
              <p className="text-ivory/70 mb-6">
                {attending
                  ? "Your RSVP has been received. We can't wait to celebrate with you under the stars!"
                  : "We're sorry you can't make it, but we appreciate you letting us know. You'll be in our hearts."}
              </p>
              {attending && isFirstRsvp && (
                <p className="text-gold/80 text-sm mb-6 italic">
                  You&apos;re in the raffle! 🎉 Your RSVP earned you one entry. Winners will be announced at the reception!
                </p>
              )}
              {attending && (
                <p className="text-ivory/50 text-sm mb-6">
                  Don&apos;t forget — Creative Cocktail meets Celestial Formal. No cream or ivory!
                </p>
              )}
              <a href="/" className="btn-outline inline-block px-6 py-2">
                Back to Home
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
