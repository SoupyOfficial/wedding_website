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
  const storyContent = `<p>Every love story starts somewhere — theirs just happens to start with a mirror selfie and a playful threat to report it. What began as two strangers trading messages became a first date, and a first date became the kind of life neither of them expected. This is how it happened.</p>
<p>From that first night to the mountains they return to every winter and the theme park that became the backdrop of their whole relationship, their story is a collection of small moments that added up to something far bigger. Here is that story, in their own words.</p>
<h2>Our First Date</h2>
<p>It all started, fittingly enough, with a selfie. Jacob posted his <em>illegal</em> locker room mirror selfie, and Ashley — ever the rule-follower — went out of her way to message him and threaten to report him. It had absolutely nothing to do with how good he looked in uniform. Not a thing. She finally scored a date out of the whole exchange, and the rest was set in motion.</p>
<blockquote>It had nothing to do with how good he looked in uniform.</blockquote>
<p>On the night of that first date, Google Maps deserves the blame for always directing guests to the wrong side of Ashley's apartment — but it's also the reason she can say she laid eyes on him first. Jacob was leaning against his car, waiting for her to come down the wrong stairs, and when he turned, she saw that smile in person for the very first time.</p>
<p>Jacob, ever the gentleman, let Ashley choose the date. She picked sushi, and he sweetly let her eat most of what they ordered. It wasn't until much later that she learned he's not exactly a big fan of sushi — a small sacrifice he's still happy to pretend he enjoyed.</p>
<p>As if the night needed a plot twist, Jacob was pledging a fraternity and on "duty" that evening — which, in practice, meant he was on call as a driver for whatever the frat needed. It turned out to be the perfect recipe for endless conversation and nonstop laughter. They wrapped the night at his apartment, hanging out with roommates and friends, playing games and laughing until late.</p>
<blockquote>The rest, as they say, is history.</blockquote>
<h2>Snowboarding</h2>
<p>Jacob taught Ashley how to snowboard — patiently, over many seasons — and it's become one of the things they look forward to most each winter. From those first shaky runs to chasing fresh powder on trips across the country, the mountains have been the backdrop for some of their favorite memories together.</p>
<p>When Jacob broke his arm on the very first day of one trip, Ashley stepped up without hesitation — keeping spirits high, handling everything, and refusing to let him hang up his board for good. She's been helping him push through the ailments of old age ever since. (He's 29.) Whether it's a quick weekend getaway or a full week on the slopes, snowboarding is <em>their</em> adventure.</p>
<blockquote>She's been helping him push through the ailments of old age ever since. (He's 29.)</blockquote>
<h2>Universal</h2>
<p>They matched on Tinder, but both working at Universal had an even bigger impact on their story. Their first conversation began when Ashley responded to a selfie Jacob posted at work, and many of their early dates were spent at the parks — endless new experiences and countless chances to learn about each other.</p>
<p>Those Universal dates never stopped. Over the years, they've brought both families, nieces and nephews, to the parks for fun and relaxation. Jacob pushed Ashley to go after the job she loves there, helping her grow into the person she is today.</p>
<p>So it was only fitting that Jacob proposed in front of the Universal globe, followed by an unforgettable weekend at Universal and Volcano Bay with their families. They took their engagement photos at Epic Universe. Full circle. ♡</p>
<h2>Things We Love</h2>
<p>Beyond the milestones, it's the small things that make their life together feel like theirs. Their cats run the house, and they wouldn't have it any other way.</p>
<p>Then there's game night — video games and board games alike, from Mario Kart marathons to late-night Catan battles. And when they're not playing, they're watching their favorite shows and movies, quoting them constantly and judging anyone who hasn't seen them.</p>
<p>And of course, there are the snowboarding trips. Hitting the slopes together is their favorite kind of adventure — the thing they already can't stop coming back to, season after season.</p>
<h2>The Next Chapter</h2>
<p>Every chapter before this one — the wrong stairs, the shared sushi, the slopes, the parks — has been leading somewhere. Now, with the globe behind them and the mountains ahead, they're writing the next one together: a wedding, a marriage, and a lifetime of adventures still to come. Full circle, and just beginning.</p>`;

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
