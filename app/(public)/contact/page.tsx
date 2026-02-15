"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">
            Contact Us
          </h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            Have a question? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div>
            <div className="card-celestial">
              <h2 className="text-gold font-serif text-2xl mb-6">
                Send Us a Message
              </h2>

              {success && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-300 text-sm">
                  Your message has been sent! We&apos;ll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
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
                <div className="flex items-start gap-3">
                  <span className="text-xl">💌</span>
                  <div>
                    <p className="text-ivory/70 text-sm font-medium">Email</p>
                    <a
                      href="mailto:forevercampbells@hotmail.com"
                      className="text-gold hover:text-gold/80 text-sm"
                    >
                      forevercampbells@hotmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-ivory/70 text-sm font-medium">Social</p>
                    <p className="text-gold text-sm">#ForeverCampbells</p>
                  </div>
                </div>
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
                &ldquo;We can&apos;t wait to celebrate with you under the stars!&rdquo;
              </p>
              <p className="text-gold/70 font-serif mt-2">
                — Jacob & Ashley
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
