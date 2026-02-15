"use client";

import { useState } from "react";

type Step = "lookup" | "details" | "meal" | "songs" | "confirm" | "done";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  mealPreference: string | null;
  dietaryNeeds: string | null;
  plusOneName: string | null;
  plusOneAllowed: boolean;
  rsvpRespondedAt: string | null;
}

interface MealOption {
  id: string;
  name: string;
  description: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
}

export default function RSVPPage() {
  const [step, setStep] = useState<Step>("lookup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [mealOptions, setMealOptions] = useState<MealOption[]>([]);

  // Form states
  const [lookupName, setLookupName] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [plusOneName, setPlusOneName] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [songRequest, setSongRequest] = useState("");
  const [songArtist, setSongArtist] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/v1/rsvp/lookup?name=${encodeURIComponent(lookupName)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Guest not found. Please check the name on your invitation.");
        return;
      }

      setGuest(data.data.guest);
      setMealOptions(data.data.mealOptions || []);
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
      setPlusOneName(data.data.guest.plusOneName || "");
      setSelectedMeal(data.data.guest.mealPreference || "");
      setStep("details");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
          plusOneName: guest.plusOneAllowed ? plusOneName : undefined,
          mealOptionId: selectedMeal || undefined,
          songRequest: songRequest || undefined,
          songArtist: songArtist || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit RSVP.");
        return;
      }

      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">RSVP</h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            We can&apos;t wait to celebrate with you!
          </p>
        </div>

        {/* Progress Steps */}
        {step !== "done" && (
          <div className="flex justify-center items-center gap-2 mb-12 max-w-md mx-auto">
            {(["lookup", "details", "meal", "songs", "confirm"] as Step[]).map(
              (s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      step === s
                        ? "bg-gold text-midnight"
                        : (["lookup", "details", "meal", "songs", "confirm"] as Step[]).indexOf(step) > i
                        ? "bg-gold/30 text-gold"
                        : "bg-royal/50 text-ivory/40"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 4 && (
                    <div className="w-6 h-px bg-gold/20" />
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
            {error}
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
                  <label className="block text-ivory/70 text-sm mb-2">
                    Enter your name as it appears on your invitation
                  </label>
                  <input
                    type="text"
                    value={lookupName}
                    onChange={(e) => setLookupName(e.target.value)}
                    placeholder="First and Last Name"
                    className="input-celestial w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !lookupName.trim()}
                  className="btn-gold w-full py-3 disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Find My Invitation"}
                </button>
              </form>
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
                  <label className="block text-ivory/70 text-sm mb-2">
                    Will you be attending?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending(true)}
                      className={`flex-1 py-3 rounded-lg border transition-colors ${
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
                      className={`flex-1 py-3 rounded-lg border transition-colors ${
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
                  <label className="block text-ivory/70 text-sm mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {guest.plusOneAllowed && (
                  <div>
                    <label className="block text-ivory/70 text-sm mb-2">
                      Plus One Name
                    </label>
                    <input
                      type="text"
                      value={plusOneName}
                      onChange={(e) => setPlusOneName(e.target.value)}
                      className="input-celestial w-full"
                      placeholder="Guest name"
                    />
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
                        setStep("meal");
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

        {/* Step 3: Meal Selection */}
        {step === "meal" && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-6">
                Meal Selection
              </h2>
              <div className="space-y-3 mb-4">
                {mealOptions.map((meal) => (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => setSelectedMeal(meal.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedMeal === meal.id
                        ? "bg-gold/20 border-gold"
                        : "border-gold/20 hover:border-gold/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-serif">{meal.name}</span>
                      <div className="flex gap-1">
                        {meal.isVegetarian && (
                          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                            V
                          </span>
                        )}
                        {meal.isVegan && (
                          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                            VG
                          </span>
                        )}
                        {meal.isGlutenFree && (
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded">
                            GF
                          </span>
                        )}
                      </div>
                    </div>
                    {meal.description && (
                      <p className="text-ivory/50 text-sm mt-1">
                        {meal.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-ivory/70 text-sm mb-2">
                  Dietary Restrictions / Allergies
                </label>
                <textarea
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="input-celestial w-full h-20 resize-none"
                  placeholder="Any allergies or dietary needs..."
                />
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
                  onClick={() => setStep("songs")}
                  className="btn-gold flex-1 py-3"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Song Requests */}
        {step === "songs" && (
          <div className="max-w-md mx-auto animate-fade-in-up">
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl text-center mb-2">
                Song Request
              </h2>
              <p className="text-center text-ivory/50 text-sm mb-6">
                Help us build the perfect playlist!
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="What song will get you on the dance floor?"
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
                    placeholder="Artist name"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("meal")}
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

        {/* Step 5: Confirm */}
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
                {attending && selectedMeal && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Meal</span>
                    <span className="text-ivory">
                      {mealOptions.find((m) => m.id === selectedMeal)?.name || "Selected"}
                    </span>
                  </div>
                )}
                {attending && dietaryNotes && (
                  <div className="flex justify-between py-2 border-b border-gold/10">
                    <span className="text-ivory/50">Dietary Notes</span>
                    <span className="text-ivory text-right max-w-[200px]">
                      {dietaryNotes}
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
