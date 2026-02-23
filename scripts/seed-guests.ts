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
  // JACOB'S FAMILY
  // ═══════════════════════════════════════════

  // Bobby Campbell, Bri, and Shanna Campbell
  { firstName: "Bobby", lastName: "Campbell", group: "Jacob's Family", notes: "Household: Bobby, Bri, and Shanna Campbell" },
  { firstName: "Bri", lastName: "Campbell", group: "Jacob's Family", notes: "Household: Bobby, Bri, and Shanna Campbell" },
  { firstName: "Shanna", lastName: "Campbell", group: "Jacob's Family", notes: "Household: Bobby, Bri, and Shanna Campbell" },

  // David Campbell, Arthur Campbell, and Jessica Campbell
  { firstName: "David", lastName: "Campbell", group: "Jacob's Family", notes: "Household: David, Arthur, and Jessica Campbell" },
  { firstName: "Arthur", lastName: "Campbell", group: "Jacob's Family", notes: "Household: David, Arthur, and Jessica Campbell" },
  { firstName: "Jessica", lastName: "Campbell", group: "Jacob's Family", notes: "Household: David, Arthur, and Jessica Campbell" },

  // Mollie Campbell
  { firstName: "Mollie", lastName: "Campbell", group: "Jacob's Family" },

  // Becky Holland and Kris Holland
  { firstName: "Becky", lastName: "Holland", group: "Jacob's Family", notes: "Household: Becky and Kris Holland" },
  { firstName: "Kris", lastName: "Holland", group: "Jacob's Family", notes: "Household: Becky and Kris Holland" },

  // Jamie Jeffery and David Jeffery
  { firstName: "Jamie", lastName: "Jeffery", group: "Jacob's Family", notes: "Household: Jamie and David Jeffery" },
  { firstName: "David", lastName: "Jeffery", group: "Jacob's Family", notes: "Household: Jamie and David Jeffery" },

  // Lori Perver, Alara, Ayla, and Semih Perver
  { firstName: "Lori", lastName: "Perver", group: "Jacob's Family", notes: "Household: Lori, Alara, Ayla, and Semih Perver" },
  { firstName: "Alara", lastName: "Perver", group: "Jacob's Family", notes: "Household: Lori, Alara, Ayla, and Semih Perver" },
  { firstName: "Ayla", lastName: "Perver", group: "Jacob's Family", notes: "Household: Lori, Alara, Ayla, and Semih Perver" },
  { firstName: "Semih", lastName: "Perver", group: "Jacob's Family", notes: "Household: Lori, Alara, Ayla, and Semih Perver" },

  // Linda Spicer and Billy Spicer
  { firstName: "Linda", lastName: "Spicer", group: "Jacob's Family", notes: "Household: Linda and Billy Spicer" },
  { firstName: "Billy", lastName: "Spicer", group: "Jacob's Family", notes: "Household: Linda and Billy Spicer" },

  // Lindsey Willis
  { firstName: "Lindsey", lastName: "Willis", group: "Jacob's Family" },

  // Jorene Faretta and Mike Faretta
  { firstName: "Jorene", lastName: "Faretta", group: "Jacob's Family", notes: "Household: Jorene and Mike Faretta" },
  { firstName: "Mike", lastName: "Faretta", group: "Jacob's Family", notes: "Household: Jorene and Mike Faretta" },

  // Rachel Gambach
  { firstName: "Rachel", lastName: "Gambach", group: "Jacob's Family" },

  // Stacy Gambach, Alex Gambach, and Mr. Gambach
  { firstName: "Stacy", lastName: "Gambach", group: "Jacob's Family", notes: "Household: Stacy, Alex, and Mr. Gambach" },
  { firstName: "Alex", lastName: "Gambach", group: "Jacob's Family", notes: "Household: Stacy, Alex, and Mr. Gambach" },
  { firstName: "Mr.", lastName: "Gambach", group: "Jacob's Family", notes: "Household: Stacy, Alex, and Mr. Gambach" },

  // Robbie Johnson and Suzie
  { firstName: "Robbie", lastName: "Johnson", group: "Jacob's Family", notes: "Household: Robbie Johnson and Suzie" },
  { firstName: "Suzie", lastName: "", group: "Jacob's Family", notes: "Household: Robbie Johnson and Suzie" },

  // Tara Lamothe
  { firstName: "Tara", lastName: "Lamothe", group: "Jacob's Family" },

  // Janet Little and Becky Little
  { firstName: "Janet", lastName: "Little", group: "Jacob's Family", notes: "Household: Janet and Becky Little" },
  { firstName: "Becky", lastName: "Little", group: "Jacob's Family", notes: "Household: Janet and Becky Little" },

  // Brittany Lowenstein and Ian Lowenstein
  { firstName: "Brittany", lastName: "Lowenstein", group: "Jacob's Family", notes: "Household: Brittany and Ian Lowenstein" },
  { firstName: "Ian", lastName: "Lowenstein", group: "Jacob's Family", notes: "Household: Brittany and Ian Lowenstein" },

  // Suzy Meszaros and Andy Meszaros
  { firstName: "Suzy", lastName: "Meszaros", group: "Jacob's Family", notes: "Household: Suzy and Andy Meszaros" },
  { firstName: "Andy", lastName: "Meszaros", group: "Jacob's Family", notes: "Household: Suzy and Andy Meszaros" },

  // Carolyn Nastovski and Chris Nastovski
  { firstName: "Carolyn", lastName: "Nastovski", group: "Jacob's Family", notes: "Household: Carolyn and Chris Nastovski" },
  { firstName: "Chris", lastName: "Nastovski", group: "Jacob's Family", notes: "Household: Carolyn and Chris Nastovski" },

  // Michael Spano and Linda Spano
  { firstName: "Michael", lastName: "Spano", group: "Jacob's Family", notes: "Household: Michael and Linda Spano" },
  { firstName: "Linda", lastName: "Spano", group: "Jacob's Family", notes: "Household: Michael and Linda Spano" },

  // Kay Turk, Chrissy, Court, and Frank Turk
  { firstName: "Kay", lastName: "Turk", group: "Jacob's Family", notes: "Household: Kay, Chrissy, Court, and Frank Turk" },
  { firstName: "Chrissy", lastName: "Turk", group: "Jacob's Family", notes: "Household: Kay, Chrissy, Court, and Frank Turk" },
  { firstName: "Court", lastName: "Turk", group: "Jacob's Family", notes: "Household: Kay, Chrissy, Court, and Frank Turk" },
  { firstName: "Frank", lastName: "Turk", group: "Jacob's Family", notes: "Household: Kay, Chrissy, Court, and Frank Turk" },

  // Eddie Young and Derrick Young
  { firstName: "Eddie", lastName: "Young", group: "Jacob's Family", notes: "Household: Eddie and Derrick Young" },
  { firstName: "Derrick", lastName: "Young", group: "Jacob's Family", notes: "Household: Eddie and Derrick Young" },

  // Keenan Young and Kim Young
  { firstName: "Keenan", lastName: "Young", group: "Jacob's Family", notes: "Household: Keenan and Kim Young" },
  { firstName: "Kim", lastName: "Young", group: "Jacob's Family", notes: "Household: Keenan and Kim Young" },

  // ═══════════════════════════════════════════
  // JACOB'S FRIENDS
  // ═══════════════════════════════════════════

  // Nate and Terriann
  { firstName: "Nate", lastName: "", group: "Jacob's Friends", notes: "Household: Nate and Terriann" },
  { firstName: "Terriann", lastName: "", group: "Jacob's Friends", notes: "Household: Nate and Terriann" },

  // Amaya Beres and guest
  { firstName: "Amaya", lastName: "Beres", group: "Jacob's Friends", plusOneAllowed: true },

  // AJ Fernandez and guest
  { firstName: "AJ", lastName: "Fernandez", group: "Jacob's Friends", plusOneAllowed: true },

  // Taylor Funk and Kyle Funk
  { firstName: "Taylor", lastName: "Funk", group: "Jacob's Friends", notes: "Household: Taylor and Kyle Funk" },
  { firstName: "Kyle", lastName: "Funk", group: "Jacob's Friends", notes: "Household: Taylor and Kyle Funk" },

  // Sabrina Gowin
  { firstName: "Sabrina", lastName: "Gowin", group: "Jacob's Friends" },

  // Drew Hildenbrand and guest
  { firstName: "Drew", lastName: "Hildenbrand", group: "Jacob's Friends", plusOneAllowed: true },

  // Holly Martin and Randy Martin
  { firstName: "Holly", lastName: "Martin", group: "Jacob's Friends", notes: "Household: Holly and Randy Martin" },
  { firstName: "Randy", lastName: "Martin", group: "Jacob's Friends", notes: "Household: Holly and Randy Martin" },

  // Rachel Palmer and guest
  { firstName: "Rachel", lastName: "Palmer", group: "Jacob's Friends", plusOneAllowed: true },

  // Ramzey Qablowi and guest
  { firstName: "Ramzey", lastName: "Qablowi", group: "Jacob's Friends", plusOneAllowed: true },

  // Stephan Victor and guest
  { firstName: "Stephan", lastName: "Victor", group: "Jacob's Friends", plusOneAllowed: true },

  // Mark Walters and Janet Walters
  { firstName: "Mark", lastName: "Walters", group: "Jacob's Friends", notes: "Household: Mark and Janet Walters" },
  { firstName: "Janet", lastName: "Walters", group: "Jacob's Friends", notes: "Household: Mark and Janet Walters" },

  // Michael Webb and guest
  { firstName: "Michael", lastName: "Webb", group: "Jacob's Friends", plusOneAllowed: true },

  // ═══════════════════════════════════════════
  // JACOB'S CO-WORKERS
  // ═══════════════════════════════════════════

  // Jeremiah Cline and guest
  { firstName: "Jeremiah", lastName: "Cline", group: "Jacob's Co-Workers", plusOneAllowed: true },

  // ═══════════════════════════════════════════
  // ASHLEY'S FAMILY
  // ═══════════════════════════════════════════

  // Kirk Augspurger and Natalie
  { firstName: "Kirk", lastName: "Augspurger", group: "Ashley's Family", notes: "Household: Kirk Augspurger and Natalie" },
  { firstName: "Natalie", lastName: "", group: "Ashley's Family", notes: "Household: Kirk Augspurger and Natalie" },

  // Nick Augspurger and Courtney Augspurger
  { firstName: "Nick", lastName: "Augspurger", group: "Ashley's Family", notes: "Household: Nick and Courtney Augspurger" },
  { firstName: "Courtney", lastName: "Augspurger", group: "Ashley's Family", notes: "Household: Nick and Courtney Augspurger" },

  // Esther Costa
  { firstName: "Esther", lastName: "Costa", group: "Ashley's Family" },

  // Sarah Delpino and Jerry Delpino
  { firstName: "Sarah", lastName: "Delpino", group: "Ashley's Family", notes: "Household: Sarah and Jerry Delpino" },
  { firstName: "Jerry", lastName: "Delpino", group: "Ashley's Family", notes: "Household: Sarah and Jerry Delpino" },

  // Karla Duke and guest
  { firstName: "Karla", lastName: "Duke", group: "Ashley's Family", plusOneAllowed: true },

  // Cuqui DuVerger
  { firstName: "Cuqui", lastName: "DuVerger", group: "Ashley's Family" },

  // Elizabeth DuVerger and Roli
  { firstName: "Elizabeth", lastName: "DuVerger", group: "Ashley's Family", notes: "Household: Elizabeth DuVerger and Roli" },
  { firstName: "Roli", lastName: "", group: "Ashley's Family", notes: "Household: Elizabeth DuVerger and Roli" },

  // Johnny DuVerger and Susan
  { firstName: "Johnny", lastName: "DuVerger", group: "Ashley's Family", notes: "Household: Johnny DuVerger and Susan" },
  { firstName: "Susan", lastName: "", group: "Ashley's Family", notes: "Household: Johnny DuVerger and Susan" },

  // Sonia Forte, Anthony, Jorge Forte, and Samantha
  { firstName: "Sonia", lastName: "Forte", group: "Ashley's Family", notes: "Household: Sonia, Anthony, Jorge, and Samantha Forte" },
  { firstName: "Anthony", lastName: "Forte", group: "Ashley's Family", notes: "Household: Sonia, Anthony, Jorge, and Samantha Forte" },
  { firstName: "Jorge", lastName: "Forte", group: "Ashley's Family", notes: "Household: Sonia, Anthony, Jorge, and Samantha Forte" },
  { firstName: "Samantha", lastName: "Forte", group: "Ashley's Family", notes: "Household: Sonia, Anthony, Jorge, and Samantha Forte" },

  // Andy Garcia, Aiden Garcia, and Jessica Garcia
  { firstName: "Andy", lastName: "Garcia", group: "Ashley's Family", notes: "Household: Andy, Aiden, and Jessica Garcia" },
  { firstName: "Aiden", lastName: "Garcia", group: "Ashley's Family", notes: "Household: Andy, Aiden, and Jessica Garcia" },
  { firstName: "Jessica", lastName: "Garcia", group: "Ashley's Family", notes: "Household: Andy, Aiden, and Jessica Garcia" },

  // ML Garcia and Luis Garcia
  { firstName: "ML", lastName: "Garcia", group: "Ashley's Family", notes: "Household: ML and Luis Garcia" },
  { firstName: "Luis", lastName: "Garcia", group: "Ashley's Family", notes: "Household: ML and Luis Garcia" },

  // Nathaniel Garcia, Henry, and Sarena Garcia
  { firstName: "Nathaniel", lastName: "Garcia", group: "Ashley's Family", notes: "Household: Nathaniel, Henry, and Sarena Garcia" },
  { firstName: "Henry", lastName: "Garcia", group: "Ashley's Family", notes: "Household: Nathaniel, Henry, and Sarena Garcia" },
  { firstName: "Sarena", lastName: "Garcia", group: "Ashley's Family", notes: "Household: Nathaniel, Henry, and Sarena Garcia" },

  // Rachael Hammoudeh and Bassam Hammoudeh
  { firstName: "Rachael", lastName: "Hammoudeh", group: "Ashley's Family", notes: "Household: Rachael and Bassam Hammoudeh" },
  { firstName: "Bassam", lastName: "Hammoudeh", group: "Ashley's Family", notes: "Household: Rachael and Bassam Hammoudeh" },

  // Collin Henderson and Riley Henderson
  { firstName: "Collin", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Collin and Riley Henderson" },
  { firstName: "Riley", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Collin and Riley Henderson" },

  // Hank Henderson, Ian Henderson, Laurie Henderson, and Owen Henderson
  { firstName: "Hank", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Hank, Ian, Laurie, and Owen Henderson" },
  { firstName: "Ian", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Hank, Ian, Laurie, and Owen Henderson" },
  { firstName: "Laurie", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Hank, Ian, Laurie, and Owen Henderson" },
  { firstName: "Owen", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Hank, Ian, Laurie, and Owen Henderson" },

  // Jared Henderson
  { firstName: "Jared", lastName: "Henderson", group: "Ashley's Family" },

  // Maddie Henderson and Mark
  { firstName: "Maddie", lastName: "Henderson", group: "Ashley's Family", notes: "Household: Maddie Henderson and Mark" },
  { firstName: "Mark", lastName: "", group: "Ashley's Family", notes: "Household: Maddie Henderson and Mark" },

  // Lexi Kelly and Shane Kelly
  { firstName: "Lexi", lastName: "Kelly", group: "Ashley's Family", notes: "Household: Lexi and Shane Kelly" },
  { firstName: "Shane", lastName: "Kelly", group: "Ashley's Family", notes: "Household: Lexi and Shane Kelly" },

  // Jodi Layton and Ali
  { firstName: "Jodi", lastName: "Layton", group: "Ashley's Family", notes: "Household: Jodi Layton and Ali" },
  { firstName: "Ali", lastName: "", group: "Ashley's Family", notes: "Household: Jodi Layton and Ali" },

  // Alicia Madeksho, Austin Madeksho, Taylor Madeksho, and Tim Madeksho
  { firstName: "Alicia", lastName: "Madeksho", group: "Ashley's Family", notes: "Household: Alicia, Austin, Taylor, and Tim Madeksho" },
  { firstName: "Austin", lastName: "Madeksho", group: "Ashley's Family", notes: "Household: Alicia, Austin, Taylor, and Tim Madeksho" },
  { firstName: "Taylor", lastName: "Madeksho", group: "Ashley's Family", notes: "Household: Alicia, Austin, Taylor, and Tim Madeksho" },
  { firstName: "Tim", lastName: "Madeksho", group: "Ashley's Family", notes: "Household: Alicia, Austin, Taylor, and Tim Madeksho" },

  // Julie Natale, Brian Natale, Caleb, and Chaz
  { firstName: "Julie", lastName: "Natale", group: "Ashley's Family", notes: "Household: Julie, Brian, Caleb, and Chaz Natale" },
  { firstName: "Brian", lastName: "Natale", group: "Ashley's Family", notes: "Household: Julie, Brian, Caleb, and Chaz Natale" },
  { firstName: "Caleb", lastName: "Natale", group: "Ashley's Family", notes: "Household: Julie, Brian, Caleb, and Chaz Natale" },
  { firstName: "Chaz", lastName: "Natale", group: "Ashley's Family", notes: "Household: Julie, Brian, Caleb, and Chaz Natale" },

  // Danette Piscopo, Dane Piscopo, Sage Piscopo, and Tony Piscopo
  { firstName: "Danette", lastName: "Piscopo", group: "Ashley's Family", notes: "Household: Danette, Dane, Sage, and Tony Piscopo" },
  { firstName: "Dane", lastName: "Piscopo", group: "Ashley's Family", notes: "Household: Danette, Dane, Sage, and Tony Piscopo" },
  { firstName: "Sage", lastName: "Piscopo", group: "Ashley's Family", notes: "Household: Danette, Dane, Sage, and Tony Piscopo" },
  { firstName: "Tony", lastName: "Piscopo", group: "Ashley's Family", notes: "Household: Danette, Dane, Sage, and Tony Piscopo" },

  // Katie Rhodes and Rodney Rhodes
  { firstName: "Katie", lastName: "Rhodes", group: "Ashley's Family", notes: "Household: Katie and Rodney Rhodes" },
  { firstName: "Rodney", lastName: "Rhodes", group: "Ashley's Family", notes: "Household: Katie and Rodney Rhodes" },

  // Lisa Sabin, Daniel Sabin, Jake, and Taylor
  { firstName: "Lisa", lastName: "Sabin", group: "Ashley's Family", notes: "Household: Lisa, Daniel, Jake, and Taylor Sabin" },
  { firstName: "Daniel", lastName: "Sabin", group: "Ashley's Family", notes: "Household: Lisa, Daniel, Jake, and Taylor Sabin" },
  { firstName: "Jake", lastName: "Sabin", group: "Ashley's Family", notes: "Household: Lisa, Daniel, Jake, and Taylor Sabin" },
  { firstName: "Taylor", lastName: "Sabin", group: "Ashley's Family", notes: "Household: Lisa, Daniel, Jake, and Taylor Sabin" },

  // Sarah Smith and Ed Smith
  { firstName: "Sarah", lastName: "Smith", group: "Ashley's Family", notes: "Household: Sarah and Ed Smith" },
  { firstName: "Ed", lastName: "Smith", group: "Ashley's Family", notes: "Household: Sarah and Ed Smith" },

  // Jane Troutner and Jerry Troutner
  { firstName: "Jane", lastName: "Troutner", group: "Ashley's Family", notes: "Household: Jane and Jerry Troutner" },
  { firstName: "Jerry", lastName: "Troutner", group: "Ashley's Family", notes: "Household: Jane and Jerry Troutner" },

  // Albert Valdes and Gina Valdes
  { firstName: "Albert", lastName: "Valdes", group: "Ashley's Family", notes: "Household: Albert and Gina Valdes" },
  { firstName: "Gina", lastName: "Valdes", group: "Ashley's Family", notes: "Household: Albert and Gina Valdes" },

  // David Valdes and Paula Valdes
  { firstName: "David", lastName: "Valdes", group: "Ashley's Family", notes: "Household: David and Paula Valdes" },
  { firstName: "Paula", lastName: "Valdes", group: "Ashley's Family", notes: "Household: David and Paula Valdes" },

  // Luis Valdes
  { firstName: "Luis", lastName: "Valdes", group: "Ashley's Family" },

  // Pam Walker and Steve Walker
  { firstName: "Pam", lastName: "Walker", group: "Ashley's Family", notes: "Household: Pam and Steve Walker" },
  { firstName: "Steve", lastName: "Walker", group: "Ashley's Family", notes: "Household: Pam and Steve Walker" },

  // Joe Wigington, Asher, Joel, Kelly Wigington, Reese, and Sophie
  { firstName: "Joe", lastName: "Wigington", group: "Ashley's Family", notes: "Household: Joe, Asher, Joel, Kelly, Reese, and Sophie Wigington" },
  { firstName: "Asher", lastName: "Wigington", group: "Ashley's Family", notes: "Household: Joe, Asher, Joel, Kelly, Reese, and Sophie Wigington" },
  { firstName: "Joel", lastName: "Wigington", group: "Ashley's Family", notes: "Household: Joe, Asher, Joel, Kelly, Reese, and Sophie Wigington" },
  { firstName: "Kelly", lastName: "Wigington", group: "Ashley's Family", notes: "Household: Joe, Asher, Joel, Kelly, Reese, and Sophie Wigington" },
  { firstName: "Reese", lastName: "Wigington", group: "Ashley's Family", notes: "Household: Joe, Asher, Joel, Kelly, Reese, and Sophie Wigington" },
  { firstName: "Sophie", lastName: "Wigington", group: "Ashley's Family", notes: "Household: Joe, Asher, Joel, Kelly, Reese, and Sophie Wigington" },

  // ═══════════════════════════════════════════
  // ASHLEY'S FRIENDS
  // ═══════════════════════════════════════════

  // Shirlene M Amoss and Rusty Amoss
  { firstName: "Shirlene M", lastName: "Amoss", group: "Ashley's Friends", notes: "Household: Shirlene M and Rusty Amoss" },
  { firstName: "Rusty", lastName: "Amoss", group: "Ashley's Friends", notes: "Household: Shirlene M and Rusty Amoss" },

  // Sofia C and Sam
  { firstName: "Sofia", lastName: "C", group: "Ashley's Friends", notes: "Household: Sofia C and Sam" },
  { firstName: "Sam", lastName: "", group: "Ashley's Friends", notes: "Household: Sofia C and Sam" },

  // Shelia Carroll and Richard Korski
  { firstName: "Shelia", lastName: "Carroll", group: "Ashley's Friends", notes: "Household: Shelia Carroll and Richard Korski" },
  { firstName: "Richard", lastName: "Korski", group: "Ashley's Friends", notes: "Household: Shelia Carroll and Richard Korski" },

  // Milan Castro and Cole Barcia
  { firstName: "Milan", lastName: "Castro", group: "Ashley's Friends", notes: "Household: Milan Castro and Cole Barcia" },
  { firstName: "Cole", lastName: "Barcia", group: "Ashley's Friends", notes: "Household: Milan Castro and Cole Barcia" },

  // Maggie Coen and Paul Coen
  { firstName: "Maggie", lastName: "Coen", group: "Ashley's Friends", notes: "Household: Maggie and Paul Coen" },
  { firstName: "Paul", lastName: "Coen", group: "Ashley's Friends", notes: "Household: Maggie and Paul Coen" },

  // Anna Craig and Doug Craig
  { firstName: "Anna", lastName: "Craig", group: "Ashley's Friends", notes: "Household: Anna and Doug Craig" },
  { firstName: "Doug", lastName: "Craig", group: "Ashley's Friends", notes: "Household: Anna and Doug Craig" },

  // Colleen Cutler
  { firstName: "Colleen", lastName: "Cutler", group: "Ashley's Friends" },

  // Marissa Delconzo and Scott Delconzo
  { firstName: "Marissa", lastName: "Delconzo", group: "Ashley's Friends", notes: "Household: Marissa and Scott Delconzo" },
  { firstName: "Scott", lastName: "Delconzo", group: "Ashley's Friends", notes: "Household: Marissa and Scott Delconzo" },
];

const client = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("👥 Seeding guests...\n");

  let created = 0;
  let skipped = 0;

  for (const guest of guests) {
    // Check for existing guest with same first name, last name, and group
    const existing = await client.execute({
      sql: `SELECT id FROM Guest WHERE firstName = ? AND lastName = ? AND "group" = ?`,
      args: [guest.firstName, guest.lastName, guest.group],
    });

    if (existing.rows.length > 0) {
      console.log(`  ⏭️  Skipped (already exists): ${guest.firstName} ${guest.lastName} [${guest.group}]`);
      skipped++;
      continue;
    }

    const now = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO Guest (id, firstName, lastName, "group", plusOneAllowed, notes, rsvpStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      args: [
        crypto.randomUUID(),
        guest.firstName,
        guest.lastName,
        guest.group,
        guest.plusOneAllowed ? 1 : 0,
        guest.notes ?? null,
        now,
        now,
      ],
    });

    const plusOneLabel = guest.plusOneAllowed ? " (+1)" : "";
    console.log(`  ✅ Created: ${guest.firstName} ${guest.lastName} [${guest.group}]${plusOneLabel}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total in list: ${guests.length}`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`\n✅ Guest seeding complete!`);
}

main()
  .catch((e) => {
    console.error("❌ Guest seeding failed:", e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
