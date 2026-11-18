import Link from "next/link";
import SectionDivider from "@/components/SectionDivider";

export default function HomeSections() {
  return (
    <>
      <SectionDivider />

      {/* Thank You */}
      <section className="section-padding text-center">
        <h2 className="heading-gold text-3xl md:text-4xl mb-6">
          Thank You!
        </h2>
        <p className="text-ivory/70 text-lg max-w-2xl mx-auto mb-8">
          Thank you to everyone who celebrated with us! We are so grateful for
          your love and support on our special day.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/gallery" className="btn-gold">
            View Wedding Photos
          </Link>
          <Link href="/photos-of-us" className="btn-outline">
            Share Your Photos
          </Link>
        </div>
      </section>

      <SectionDivider />
    </>
  );
}
