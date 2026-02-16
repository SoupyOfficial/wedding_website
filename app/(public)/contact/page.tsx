"use client";

import { useState } from "react";
import { usePublicSettings } from "@/lib/hooks";
import { PageHeader, Alert } from "@/components/ui";

export default function ContactPage() {
  const { settings } = usePublicSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const coupleNames = settings?.coupleName || "Jacob & Ashley";
  const contactEmail = settings?.contactEmailJoint || "";
  const hashtag = settings?.weddingHashtag || "#ForeverCampbells";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send message.");
        return;
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader title="Contact Us" subtitle="Have a question? We'd love to hear from you." />

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div>
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl mb-6">
                Send Us a Message
              </h2>

              {success && (
                <Alert type="success" message="Your message has been sent! We'll get back to you soon." className="mb-4" />
              )}

              {error && (
                <Alert type="error" message={error} className="mb-4" />
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-celestial w-full"
                    placeholder="What's this about?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-sm mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-celestial w-full h-32 resize-none"
                    placeholder="Your message..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full py-3 disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card-celestial">
              <h3 className="text-gold font-serif text-xl mb-4">
                Get in Touch
              </h3>
              <div className="space-y-4">
                {contactEmail && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">💌</span>
                    <div>
                      <p className="text-ivory/70 text-sm font-medium">
                        Email
                      </p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-gold hover:text-gold/80 text-sm"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {hashtag && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-ivory/70 text-sm font-medium">
                        Social
                      </p>
                      <p className="text-gold text-sm">{hashtag}</p>
                    </div>
                  </div>
                )}
                {settings?.socialInstagram && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📷</span>
                    <div>
                      <p className="text-ivory/70 text-sm font-medium">
                        Instagram
                      </p>
                      <a
                        href={`https://instagram.com/${settings.socialInstagram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:text-gold/80 text-sm"
                      >
                        {settings.socialInstagram}
                      </a>
                    </div>
                  </div>
                )}
                {settings?.socialFacebook && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">👥</span>
                    <div>
                      <p className="text-ivory/70 text-sm font-medium">
                        Facebook
                      </p>
                      <a
                        href={settings.socialFacebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:text-gold/80 text-sm"
                      >
                        Facebook Page
                      </a>
                    </div>
                  </div>
                )}
                {settings?.socialTikTok && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎵</span>
                    <div>
                      <p className="text-ivory/70 text-sm font-medium">
                        TikTok
                      </p>
                      <a
                        href={`https://tiktok.com/@${settings.socialTikTok.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:text-gold/80 text-sm"
                      >
                        {settings.socialTikTok}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-celestial">
              <h3 className="text-gold font-serif text-xl mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href="/rsvp"
                  className="block text-ivory/70 hover:text-gold text-sm transition-colors"
                >
                  → RSVP to our wedding
                </a>
                <a
                  href="/event-details"
                  className="block text-ivory/70 hover:text-gold text-sm transition-colors"
                >
                  → View event details
                </a>
                <a
                  href="/travel"
                  className="block text-ivory/70 hover:text-gold text-sm transition-colors"
                >
                  → Travel & accommodations
                </a>
                <a
                  href="/faq"
                  className="block text-ivory/70 hover:text-gold text-sm transition-colors"
                >
                  → Frequently asked questions
                </a>
              </div>
            </div>

            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🌙</div>
              <p className="text-ivory/50 text-sm italic">
                &ldquo;We can&apos;t wait to celebrate with you under the
                stars!&rdquo;
              </p>
              <p className="text-gold/70 font-serif mt-2">
                — {coupleNames}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
