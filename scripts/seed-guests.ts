/**
 * Seed script for wedding guest list.
 *
 * Usage:
 *   npx tsx scripts/seed-guests.ts
 *
 * Safety:
 *   - Idempotent: skips any guest whose firstName + lastName already
 *     exists (WHERE NOT EXISTS guard, mirroring prisma/seed.ts), so
 *     re-running the script never duplicates the guest list.
 *   - Only inserts; never deletes or overwrites existing guests.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import crypto from "crypto";

interface GuestInput {
  firstName: string;
  lastName: string;
  plusOneAllowed?: boolean;
  notes?: string;
}

const guests: GuestInput[] = [
  { firstName: "Andy", lastName: "Garcia" },
  { firstName: "Jessica", lastName: "Messer" },
  { firstName: "Aiden", lastName: "Garcia" },
  { firstName: "Mary Lorraine", lastName: "Garcia" },
  { firstName: "Luis", lastName: "Garcia" },
  { firstName: "Nathaniel", lastName: "Garcia" },
  { firstName: "Sarena", lastName: "Garcia", notes: "Baby William — under 1" },
  { firstName: "William", lastName: "Garcia", notes: "Infant — under 1" },
  { firstName: "Henry", lastName: "Garcia" },
  { firstName: "Kirk", lastName: "Augspurger" },
  { firstName: "Natalie", lastName: "Augspurger" },
  { firstName: "Esther", lastName: "Costa", plusOneAllowed: true },
  { firstName: "Albert", lastName: "Valdes" },
  { firstName: "Gina", lastName: "Valdes" },
  { firstName: "Sarah", lastName: "Delpino" },
  { firstName: "Jerry", lastName: "Delpino" },
  { firstName: "Karla", lastName: "Duke", plusOneAllowed: true },
  { firstName: "Cuqui", lastName: "Duverger" },
  { firstName: "Luis", lastName: "Valdes" },
  { firstName: "Elizabeth", lastName: "Duverger" },
  { firstName: "Roly", lastName: "Febles" },
  { firstName: "Sonia", lastName: "Forte" },
  { firstName: "Jorge", lastName: "Forte" },
  { firstName: "Anthony", lastName: "Forte" },
  { firstName: "Samantha", lastName: "Forte" },
  { firstName: "Rachael", lastName: "Hammoudeh" },
  { firstName: "Bassam", lastName: "Hammoudeh" },
  { firstName: "Collin", lastName: "Henderson" },
  { firstName: "Riley", lastName: "Henderson" },
  { firstName: "Hank", lastName: "Henderson" },
  { firstName: "Laurie", lastName: "Henderson" },
  { firstName: "Owen", lastName: "Henderson" },
  { firstName: "Ian", lastName: "Henderson" },
  { firstName: "Maddie", lastName: "Henderson" },
  { firstName: "Mark", lastName: "Hartigan" },
  { firstName: "Lexi", lastName: "Kelly" },
  { firstName: "Shane", lastName: "Kelly" },
  { firstName: "Jodi", lastName: "Layton" },
  { firstName: "Ali", lastName: "Barker" },
  { firstName: "Alicia", lastName: "Madeksho" },
  { firstName: "Tim", lastName: "Madeksho" },
  { firstName: "Taylor", lastName: "Madeksho" },
  { firstName: "Austin", lastName: "Madeksho" },
  { firstName: "Julie", lastName: "Natale" },
  { firstName: "Brian", lastName: "Natale" },
  { firstName: "Chaz", lastName: "Brigstock" },
  { firstName: "Caleb", lastName: "Brigstock" },
  { firstName: "Danette", lastName: "Piscopo" },
  { firstName: "Tony", lastName: "Piscopo" },
  { firstName: "Dane", lastName: "Piscopo" },
  { firstName: "Sage", lastName: "Piscopo" },
  { firstName: "Katie", lastName: "Rhodes" },
  { firstName: "Rodney", lastName: "Rhodes" },
  { firstName: "Lisa", lastName: "Sabin" },
  { firstName: "Daniel", lastName: "Sabin" },
  { firstName: "Taylor", lastName: "Sabin" },
  { firstName: "Jake", lastName: "Sabin" },
  { firstName: "Sarah", lastName: "Smith" },
  { firstName: "Ed", lastName: "Smith" },
  { firstName: "David", lastName: "Valdes" },
  { firstName: "Paula", lastName: "Valdes" },
  { firstName: "Pam", lastName: "Walker" },
  { firstName: "Steve", lastName: "Walker" },
  { firstName: "Jane", lastName: "Troutner" },
  { firstName: "Jerry", lastName: "Troutner" },
  { firstName: "Kelly", lastName: "Wigington", notes: "Baby Sophie — under 2" },
  { firstName: "Sophie", lastName: "Wigington", notes: "Toddler — under 2" },
  { firstName: "Joe", lastName: "Wigington" },
  { firstName: "Joel", lastName: "Wigington" },
  { firstName: "Asher", lastName: "Wigington" },
  { firstName: "Reese", lastName: "Wigington" },
  { firstName: "Edie", lastName: "Young" },
  { firstName: "Derrick", lastName: "Young" },
  { firstName: "Jared", lastName: "Henderson" },
  { firstName: "Shirlene", lastName: "Amoss" },
  { firstName: "Rusty", lastName: "Amoss" },
  { firstName: "Renee", lastName: "Blair" },
  { firstName: "Gary", lastName: "Blair" },
  { firstName: "Sofia", lastName: "Caceres" },
  { firstName: "Sam", lastName: "Chitwood" },
  { firstName: "Shelia", lastName: "Carroll" },
  { firstName: "Richard", lastName: "Korski" },
  { firstName: "Anna", lastName: "Craig" },
  { firstName: "Doug", lastName: "Craig" },
  { firstName: "Colleen", lastName: "Cutler" },
  { firstName: "Dr. Winston", lastName: "Miller" },
  { firstName: "Pam", lastName: "Miller" },
  { firstName: "Jonathan", lastName: "Miller" },
  { firstName: "Nicole", lastName: "Miller" },
  { firstName: "Layla", lastName: "Miller" },
  { firstName: "Travis", lastName: "Miller" },
  { firstName: "Milan", lastName: "Castro" },
  { firstName: "Cole", lastName: "Barcia" },
  { firstName: "Maggie", lastName: "Coen" },
  { firstName: "Paul", lastName: "Coen" },
  { firstName: "Marissa", lastName: "Dalconzo", notes: "Baby Riley — under 2" },
  { firstName: "Riley", lastName: "Dalconzo", notes: "Toddler — under 2" },
  { firstName: "Scott", lastName: "Dalconzo" },
  { firstName: "Kayla", lastName: "Erickson" },
  { firstName: "Jeff", lastName: "Erickson" },
  { firstName: "Bobby", lastName: "Campbell" },
  { firstName: "Sheena", lastName: "Campbell" },
  { firstName: "Bri", lastName: "Campbell" },
  { firstName: "David", lastName: "Campbell" },
  { firstName: "Jessica", lastName: "Campbell" },
  { firstName: "Arthur", lastName: "Campbell" },
  { firstName: "Mollie", lastName: "Campbell" },
  { firstName: "Becky", lastName: "Holland" },
  { firstName: "Kris", lastName: "Holland" },
  { firstName: "Jamie", lastName: "Jeffrey", notes: "Baby — under 1" },
  { firstName: "David", lastName: "Jeffrey" },
  { firstName: "Lori", lastName: "Perver" },
  { firstName: "Semih", lastName: "Perver" },
  { firstName: "Alara", lastName: "Perver" },
  { firstName: "Linda", lastName: "Spicer" },
  { firstName: "Billy", lastName: "Spicer" },
  { firstName: "Janet", lastName: "Little" },
  { firstName: "Becky", lastName: "Tucker" },
  { firstName: "Jorene", lastName: "Faretta" },
  { firstName: "Mike", lastName: "Faretta" },
  { firstName: "Rachel", lastName: "Gambach" },
  { firstName: "Staci", lastName: "Gambach" },
  { firstName: "David", lastName: "Gambach" },
  { firstName: "Alex", lastName: "Gambach" },
  { firstName: "Robbie", lastName: "Johnson" },
  { firstName: "Suzie", lastName: "Johnson" },
  { firstName: "Brittany", lastName: "Lowenstein" },
  { firstName: "Ian", lastName: "Lowenstein" },
  { firstName: "Susy", lastName: "Meszaros" },
  { firstName: "Andy", lastName: "Meszaros" },
  { firstName: "Carolyn", lastName: "Nastovski" },
  { firstName: "Chris", lastName: "Nastovski" },
  { firstName: "Linda", lastName: "Spano" },
  { firstName: "Michael", lastName: "Spano" },
  { firstName: "Kay", lastName: "Turk" },
  { firstName: "Frank", lastName: "Turk" },
  { firstName: "Aj", lastName: "Fernandez", plusOneAllowed: true },
  { firstName: "Sabrina", lastName: "Gowin" },
  { firstName: "Nate", lastName: "Hardison" },
  { firstName: "Terriann", lastName: "Hardison" },
  { firstName: "Rachel", lastName: "Palmer", plusOneAllowed: true },
  { firstName: "Billy", lastName: "Wills" },
  { firstName: "Lindsay", lastName: "Wills" },
  { firstName: "Michael", lastName: "Webb", plusOneAllowed: true },
  { firstName: "Jeremiah", lastName: "Cline", plusOneAllowed: true },
];

const client = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log(`👥 Inserting ${guests.length} guests...\n`);

  let inserted = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  for (const g of guests) {
    const id = crypto.randomUUID();
    const result = await client.execute({
      sql: `INSERT OR IGNORE INTO Guest (id, firstName, lastName, plusOneAllowed, notes, rsvpStatus, createdAt, updatedAt)
            SELECT ?, ?, ?, ?, ?, 'pending', ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM Guest WHERE firstName = ? AND lastName = ?
            )`,
      args: [
        id,
        g.firstName,
        g.lastName,
        g.plusOneAllowed ? 1 : 0,
        g.notes || null,
        now,
        now,
        g.firstName,
        g.lastName,
      ],
    });

    if (result.rowsAffected > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  console.log(`✅ Inserted: ${inserted}`);
  console.log(`⏭️  Skipped (already exists): ${skipped}`);
  console.log(`📊 Total in guest list: ${guests.length}`);

  const count = await client.execute("SELECT COUNT(*) as cnt FROM Guest");
  console.log(`📊 Total guests in database: ${count.rows[0].cnt}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
