import Link from "next/link";

export default function PageDisabled() {
  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <div className="max-w-lg mx-auto text-center card-celestial">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-gold font-serif text-2xl mb-3">
            Page Not Available
          </h1>
          <p className="text-ivory/60 leading-relaxed mb-6">
            This page is currently not available. Please check back later or
            return to the homepage.
          </p>
          <Link href="/" className="btn-gold inline-block px-6 py-2">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
