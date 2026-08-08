import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  const storyContent = `First Date

Step 1: The Selfie — Jacob posted his illegal locker room mirror selfie and I of course had to go out of my way to message him and threaten to report him. It had nothing to do with how good he looked in his uniform. With this, I finally scored a date.

Step 2: First Look — I'll let Google Maps take the blame for always directing my guests to the wrong side of my apartment building, but it is the reason I get to say I laid eyes on him first, leaning against the hood of his car, waiting for me to come down the wrong stairs. And when he turned, I got to see his amazing smile in person for the first time.

Step 3: Sushi — The gentleman he is, Jacob let me choose our date, and I picked sushi. He was so sweet and let me eat most of what we ordered. It wasn't until much later I found out he was not a big fan of sushi.

Step 4: When picking me up for the date, Jacob let me know he was pledging a frat and he was on "duty" that night. This basically meant he was on call as an uber for the frat's activities. Little did we know how perfect this would be for keeping conversation and laughter flowing.

Step 5: We ended the date by hanging out at his apartment, meeting his roommates and friends, playing games and enjoying the night.

Universal

We may have matched on Tinder, but us both working at Universal had a huge impact on our relationship. The conversation that sparked our first date was started from me responding to a selfie he posted at work. Several of our first dates were at Universal, giving us lots of new experiences together and many opportunities to learn new things about each other. Our dates to Universal have never stopped. We have been lucky enough to bring both of our families, nieces and nephews to the parks for fun and relaxation. Jacob pushed me to get the job I love at Universal, helping me grow so much as a person and adult. Jacob surprised me with a perfect engagement in front of the Universal globe, followed by a wonderful engagement weekend at Universal and Volcano Bay with our families. We are getting our engagement photos done at Epic Universe.

Things We Love

• Our cats — they run the house and we wouldn't have it any other way
• Video games and board games — from Mario Kart marathons to late-night Catan battles
• Favorite shows and movies — we quote them constantly and judge people who haven't seen them
• Snowboarding trips — hitting the slopes together is our favorite kind of adventure`;

  await client.execute({
    sql: `UPDATE SiteSettings SET ourStoryContent = ? WHERE id = 'singleton'`,
    args: [storyContent],
  });

  console.log("✅ Our Story content updated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
