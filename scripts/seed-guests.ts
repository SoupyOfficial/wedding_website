/**
 * Seed script for wedding guest list.
 *
 * Usage:
 *   npx tsx scripts/seed-guests.ts
 *
 * Safety:
 *   - Uses INSERT OR IGNORE to avoid duplicates on re-run.
 *   - Only inserts; never deletes or overwrites existing guests.
 */
import "dotenv/config";
import { createClient } from "@libsql/client";
import crypto from "crypto";

interface GuestInput {
  firstName: string;
  lastName: string;
  group: string;
  plusOneAllowed?: boolean;
  notes?: string;
}

const guests: GuestInput[] = [
  // ═══════════════════════════════════════════
  // ASHLEY'S FAMILY
  // ═══════════════════════════════════════════
  { firstName: "Andy", lastName: "Garcia", group: "Ashley's Family" },
  { firstName: "Jessica", lastName: "Messer", group: "Ashley's Family" },
  { firstName: "Aiden", lastName: "Garcia", group: "Ashley's Family" },
  { firstName: "Mary Lorraine", lastName: "Garcia", group: "Ashley's Family" },
  { firstName: "Luis", lastName: "Garcia", group: "Ashley's Family" },
  { firstName: "Nathaniel", lastName: "Garcia", group: "Ashley's Family" },
  { firstName: "Sarena", lastName: "Garcia", group: "Ashley's Family", notes: "Baby William — under 1" },
  { firstName: "William", lastName: "Garcia", group: "Ashley's Family", notes: "Infant — under 1" },
  { firstName: "Henry", lastName: "Garcia", group: "Ashley's Family" },
  { firstName: "Kirk", lastName: "Augspurger", group: "Ashley's Family" },
  { firstName: "Natalie", lastName: "Augspurger", group: "Ashley's Family" },
  { firstName: "Esther", lastName: "Costa", group: "Ashley's Family", plusOneAllowed: true },
  { firstName: "Albert", lastName: "Valdes", group: "Ashley's Family" },
  { firstName: "Gina", lastName: "Valdes", group: "Ashley's Family" },
  { firstName: "Sarah", lastName: "Delpino", group: "Ashley's Family" },
  { firstName: "Jerry", lastName: "Delpino", group: "Ashley's Family" },
  { firstName: "Karla", lastName: "Duke", group: "Ashley's Family", plusOneAllowed: true },
  { firstName: "Cuqui", lastName: "Duverger", group: "Ashley's Family" },
  { firstName: "Luis", lastName: "Valdes", group: "Ashley's Family" },
  { firstName: "Elizabeth", lastName: "Duverger", group: "Ashley's Family" },
  { firstName: "Roly", lastName: "Febles", group: "Ashley's Family" },
  { firstName: "Sonia", lastName: "Forte", group: "Ashley's Family" },
  { firstName: "Jorge", lastName: "Forte", group: "Ashley's Family" },
  { firstName: "Anthony", lastName: "Forte", group: "Ashley's Family" },
  { firstName: "Samantha", lastName: "Forte", group: "Ashley's Family" },
  { firstName: "Rachael", lastName: "Hammoudeh", group: "Ashley's Family" },
  { firstName: "Bassam", lastName: "Hammoudeh", group: "Ashley's Family" },
  { firstName: "Collin", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Riley", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Hank", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Laurie", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Owen", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Ian", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Maddie", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Mark", lastName: "Hartigan", group: "Ashley's Family" },
  { firstName: "Lexi", lastName: "Kelly", group: "Ashley's Family" },
  { firstName: "Shane", lastName: "Kelly", group: "Ashley's Family" },
  { firstName: "Jodi", lastName: "Layton", group: "Ashley's Family" },
  { firstName: "Ali", lastName: "Barker", group: "Ashley's Family" },
  { firstName: "Alicia", lastName: "Madeksho", group: "Ashley's Family" },
  { firstName: "Tim", lastName: "Madeksho", group: "Ashley's Family" },
  { firstName: "Taylor", lastName: "Madeksho", group: "Ashley's Family" },
  { firstName: "Austin", lastName: "Madeksho", group: "Ashley's Family" },
  { firstName: "Julie", lastName: "Natale", group: "Ashley's Family" },
  { firstName: "Brian", lastName: "Natale", group: "Ashley's Family" },
  { firstName: "Chaz", lastName: "Brigstock", group: "Ashley's Family" },
  { firstName: "Caleb", lastName: "Brigstock", group: "Ashley's Family" },
  { firstName: "Danette", lastName: "Piscopo", group: "Ashley's Family" },
  { firstName: "Tony", lastName: "Piscopo", group: "Ashley's Family" },
  { firstName: "Dane", lastName: "Piscopo", group: "Ashley's Family" },
  { firstName: "Sage", lastName: "Piscopo", group: "Ashley's Family" },
  { firstName: "Katie", lastName: "Rhodes", group: "Ashley's Family" },
  { firstName: "Rodney", lastName: "Rhodes", group: "Ashley's Family" },
  { firstName: "Lisa", lastName: "Sabin", group: "Ashley's Family" },
  { firstName: "Daniel", lastName: "Sabin", group: "Ashley's Family" },
  { firstName: "Taylor", lastName: "Sabin", group: "Ashley's Family" },
  { firstName: "Jake", lastName: "Sabin", group: "Ashley's Family" },
  { firstName: "Sarah", lastName: "Smith", group: "Ashley's Family" },
  { firstName: "Ed", lastName: "Smith", group: "Ashley's Family" },
  { firstName: "David", lastName: "Valdes", group: "Ashley's Family" },
  { firstName: "Paula", lastName: "Valdes", group: "Ashley's Family" },
  { firstName: "Pam", lastName: "Walker", group: "Ashley's Family" },
  { firstName: "Steve", lastName: "Walker", group: "Ashley's Family" },
  { firstName: "Jane", lastName: "Troutner", group: "Ashley's Family" },
  { firstName: "Jerry", lastName: "Troutner", group: "Ashley's Family" },
  { firstName: "Kelly", lastName: "Wigington", group: "Ashley's Family", notes: "Baby Sophie — under 2" },
  { firstName: "Sophie", lastName: "Wigington", group: "Ashley's Family", notes: "Toddler — under 2" },
  { firstName: "Joe", lastName: "Wigington", group: "Ashley's Family" },
  { firstName: "Joel", lastName: "Wigington", group: "Ashley's Family" },
  { firstName: "Asher", lastName: "Wigington", group: "Ashley's Family" },
  { firstName: "Reese", lastName: "Wigington", group: "Ashley's Family" },
  { firstName: "Edie", lastName: "Young", group: "Ashley's Family" },
  { firstName: "Derrick", lastName: "Young", group: "Ashley's Family" },
  { firstName: "Jared", lastName: "Henderson", group: "Ashley's Family" },
  { firstName: "Shirlene", lastName: "Amoss", group: "Ashley's Family" },
  { firstName: "Rusty", lastName: "Amoss", group: "Ashley's Family" },
  { firstName: "Renee", lastName: "Blair", group: "Ashley's Family" },
  { firstName: "Gary", lastName: "Blair", group: "Ashley's Family" },
  { firstName: "Sofia", lastName: "Caceres", group: "Ashley's Family" },
  { firstName: "Sam", lastName: "Chitwood", group: "Ashley's Family" },
  { firstName: "Shelia", lastName: "Carroll", group: "Ashley's Family" },
  { firstName: "Richard", lastName: "Korski", group: "Ashley's Family" },
  { firstName: "Anna", lastName: "Craig", group: "Ashley's Family" },
  { firstName: "Doug", lastName: "Craig", group: "Ashley's Family" },
  { firstName: "Colleen", lastName: "Cutler", group: "Ashley's Family" },
  { firstName: "Dr. Winston", lastName: "Miller", group: "Ashley's Family" },
  { firstName: "Pam", lastName: "Miller", group: "Ashley's Family" },
  { firstName: "Jonathan", lastName: "Miller", group: "Ashley's Family" },
  { firstName: "Nicole", lastName: "Miller", group: "Ashley's Family" },
  { firstName: "Layla", lastName: "Miller", group: "Ashley's Family" },
  { firstName: "Travis", lastName: "Miller", group: "Ashley's Family" },

  // ═══════════════════════════════════════════
  // ASHLEY'S FRIENDS
  // ═══════════════════════════════════════════
  { firstName: "Milan", lastName: "Castro", group: "Ashley's Friends" },
  { firstName: "Cole", lastName: "Barcia", group: "Ashley's Friends" },
  { firstName: "Maggie", lastName: "Coen", group: "Ashley's Friends" },
  { firstName: "Paul", lastName: "Coen", group: "Ashley's Friends" },
  { firstName: "Marissa", lastName: "Dalconzo", group: "Ashley's Friends", notes: "Baby Riley — under 2" },
  { firstName: "Riley", lastName: "Dalconzo", group: "Ashley's Friends", notes: "Toddler — under 2" },
  { firstName: "Scott", lastName: "Dalconzo", group: "Ashley's Friends" },
  { firstName: "Kayla", lastName: "Erickson", group: "Ashley's Friends" },
  { firstName: "Jeff", lastName: "Erickson", group: "Ashley's Friends" },

  // ═══════════════════════════════════════════
  // JACOB'S FAMILY
  // ═══════════════════════════════════════════
  { firstName: "Bobby", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "Sheena", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "Bri", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "David", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "Jessica", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "Arthur", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "Mollie", lastName: "Campbell", group: "Jacob's Family" },
  { firstName: "Becky", lastName: "Holland", group: "Jacob's Family" },
  { firstName: "Kris", lastName: "Holland", group: "Jacob's Family" },
  { firstName: "Jamie", lastName: "Jeffrey", group: "Jacob's Family", notes: "Baby — under 1" },
  { firstName: "David", lastName: "Jeffrey", group: "Jacob's Family" },
  { firstName: "Lori", lastName: "Perver", group: "Jacob's Family" },
  { firstName: "Semih", lastName: "Perver", group: "Jacob's Family" },
  { firstName: "Alara", lastName: "Perver", group: "Jacob's Family" },
  { firstName: "Linda", lastName: "Spicer", group: "Jacob's Family" },
  { firstName: "Billy", lastName: "Spicer", group: "Jacob's Family" },
  { firstName: "Janet", lastName: "Little", group: "Jacob's Family" },
  { firstName: "Becky", lastName: "Tucker", group: "Jacob's Family" },
  { firstName: "Jorene", lastName: "Faretta", group: "Jacob's Family" },
  { firstName: "Mike", lastName: "Faretta", group: "Jacob's Family" },
  { firstName: "Rachel", lastName: "Gambach", group: "Jacob's Family" },
  { firstName: "Staci", lastName: "Gambach", group: "Jacob's Family" },
  { firstName: "David", lastName: "Gambach", group: "Jacob's Family" },
  { firstName: "Alex", lastName: "Gambach", group: "Jacob's Family" },
  { firstName: "Robbie", lastName: "Johnson", group: "Jacob's Family" },
  { firstName: "Suzie", lastName: "Johnson", group: "Jacob's Family" },
  { firstName: "Brittany", lastName: "Lowenstein", group: "Jacob's Family" },
  { firstName: "Ian", lastName: "Lowenstein", group: "Jacob's Family" },
  { firstName: "Susy", lastName: "Meszaros", group: "Jacob's Family" },
  { firstName: "Andy", lastName: "Meszaros", group: "Jacob's Family" },
  { firstName: "Carolyn", lastName: "Nastovski", group: "Jacob's Family" },
  { firstName: "Chris", lastName: "Nastovski", group: "Jacob's Family" },
  { firstName: "Linda", lastName: "Spano", group: "Jacob's Family" },
  { firstName: "Michael", lastName: "Spano", group: "Jacob's Family" },
  { firstName: "Kay", lastName: "Turk", group: "Jacob's Family" },
  { firstName: "Frank", lastName: "Turk", group: "Jacob's Family" },

  // ═══════════════════════════════════════════
  // JACOB'S FRIENDS
  // ═══════════════════════════════════════════
  { firstName: "Aj", lastName: "Fernandez", group: "Jacob's Friends", plusOneAllowed: true },
  { firstName: "Sabrina", lastName: "Gowin", group: "Jacob's Friends" },
  { firstName: "Nate", lastName: "Hardison", group: "Jacob's Friends" },
  { firstName: "Terriann", lastName: "Hardison", group: "Jacob's Friends" },
  { firstName: "Rachel", lastName: "Palmer", group: "Jacob's Friends", plusOneAllowed: true },
  { firstName: "Billy", lastName: "Wills", group: "Jacob's Friends" },
  { firstName: "Lindsay", lastName: "Wills", group: "Jacob's Friends" },
  { firstName: "Michael", lastName: "Webb", group: "Jacob's Friends", plusOneAllowed: true },

  // ═══════════════════════════════════════════
  // JACOB'S CO-WORKERS
  // ═══════════════════════════════════════════
  { firstName: "Jeremiah", lastName: "Cline", group: "Jacob's Co-Workers", plusOneAllowed: true },
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
      sql: `INSERT OR IGNORE INTO Guest (id, firstName, lastName, "group", plusOneAllowed, notes, rsvpStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      args: [
        id,
        g.firstName,
        g.lastName,
        g.group,
        g.plusOneAllowed ? 1 : 0,
        g.notes || null,
        now,
        now,
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
