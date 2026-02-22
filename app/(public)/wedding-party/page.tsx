import prisma from "@/lib/db";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";

type WPMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  relationToBrideOrGroom: string;
  spouseOrPartner: string;
  sortOrder: number;
};

export const metadata = {
  title: "Wedding Party",
  description: "Meet the bridesmaids, groomsmen, and special members of our wedding party.",
};

/** Detect if a role is a flower girl or ring bearer */
function isFlowerGirlOrRingBearer(role: string): boolean {
  const lower = role.toLowerCase();
  return (
    lower.includes("flower girl") ||
    lower.includes("ring bearer") ||
    lower.includes("flowergirl") ||
    lower.includes("ringbearer") ||
    lower.includes("junior bridesmaid") ||
    lower.includes("junior groomsman")
  );
}

/** Get a fallback emoji for a role */
function roleEmoji(role: string, side: string): string {
  const lower = role.toLowerCase();
  if (lower.includes("flower girl")) return "🌸";
  if (lower.includes("ring bearer")) return "💍";
  if (lower.includes("maid of honor") || lower.includes("matron of honor")) return "👑";
  if (lower.includes("best man")) return "👑";
  if (lower.includes("man of honor")) return "👑";
  if (side === "bride") return "✨";
  if (side === "groom") return "⭐";
  return "🌟";
}

function MemberCard({
  member,
  size = "normal",
}: {
  member: WPMember & { side: string };
  size?: "normal" | "small";
}) {
  const isSmall = size === "small";
  const photoSize = isSmall ? "w-20 h-20" : "w-28 h-28 md:w-32 md:h-32";
  const textSize = isSmall ? "text-base" : "text-lg";

  return (
    <div className="card-celestial text-center group hover:scale-[1.03] transition-transform duration-300">
      {/* Photo */}
      <div
        className={`${photoSize} mx-auto mb-4 rounded-full bg-royal/50 border-2 border-gold/30 flex items-center justify-center overflow-hidden group-hover:border-gold/60 transition-colors`}
      >
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={isSmall ? "text-2xl" : "text-3xl"}>
            {roleEmoji(member.role, member.side)}
          </span>
        )}
      </div>

      {/* Name & Role */}
      <h3 className={`text-gold font-serif ${textSize} mb-1`}>
        {member.name}
      </h3>
      <p className="text-ivory/50 text-xs uppercase tracking-wider mb-2">
        {member.role}
      </p>

      {/* Relation */}
      {member.relationToBrideOrGroom && (
        <p className="text-ivory/40 text-xs italic mb-2">
          {member.relationToBrideOrGroom}
        </p>
      )}

      {/* Spouse/Partner */}
      {member.spouseOrPartner && (
        <p className="text-ivory/40 text-xs mb-2">
          Partner: {member.spouseOrPartner}
        </p>
      )}

      {/* Bio */}
      {member.bio && (
        <div className="mt-3 pt-3 border-t border-gold/10">
          <p className="text-ivory/60 text-sm leading-relaxed">{member.bio}</p>
        </div>
      )}
    </div>
  );
}

export default async function WeddingPartyPage() {
  const allBrideSide = await prisma.weddingPartyMember.findMany({
    where: { side: "bride" },
    orderBy: { sortOrder: "asc" },
  });

  const allGroomSide = await prisma.weddingPartyMember.findMany({
    where: { side: "groom" },
    orderBy: { sortOrder: "asc" },
  });

  const special = await prisma.weddingPartyMember.findMany({
    where: { side: "special" },
    orderBy: { sortOrder: "asc" },
  });

  // Separate bridal party from flower girls / ring bearers
  const bridesmaids = allBrideSide.filter((m) => !isFlowerGirlOrRingBearer(m.role));
  const brideJuniors = allBrideSide.filter((m) => isFlowerGirlOrRingBearer(m.role));
  const groomsmen = allGroomSide.filter((m) => !isFlowerGirlOrRingBearer(m.role));
  const groomJuniors = allGroomSide.filter((m) => isFlowerGirlOrRingBearer(m.role));

  // Combine all flower girls & ring bearers
  const flowerGirlsAndRingBearers = [
    ...brideJuniors,
    ...groomJuniors,
    ...special.filter((m) => isFlowerGirlOrRingBearer(m.role)),
  ];
  const otherSpecial = special.filter((m) => !isFlowerGirlOrRingBearer(m.role));

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Wedding Party"
          subtitle="The amazing people standing by our side on our special day"
          className="mb-16"
        />

        {/* Bride's Side */}
        {bridesmaids.length > 0 && (
          <div className="mb-16">
            <h2 className="heading-gold text-3xl text-center mb-2">
              The Bride&apos;s Side
            </h2>
            <p className="text-ivory/50 text-center text-sm mb-8">
              Bridesmaids &amp; Maid of Honor
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {bridesmaids.map((member: WPMember) => (
                <MemberCard key={member.id} member={{ ...member, side: "bride" }} />
              ))}
            </div>
          </div>
        )}

        {bridesmaids.length > 0 && groomsmen.length > 0 && <SectionDivider />}

        {/* Groom's Side */}
        {groomsmen.length > 0 && (
          <div className="mb-16">
            <h2 className="heading-gold text-3xl text-center mb-2">
              The Groom&apos;s Side
            </h2>
            <p className="text-ivory/50 text-center text-sm mb-8">
              Groomsmen &amp; Best Man
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {groomsmen.map((member: WPMember) => (
                <MemberCard key={member.id} member={{ ...member, side: "groom" }} />
              ))}
            </div>
          </div>
        )}

        {/* Flower Girls & Ring Bearers */}
        {flowerGirlsAndRingBearers.length > 0 && (
          <>
            <SectionDivider />
            <div className="mb-16">
              <h2 className="heading-gold text-3xl text-center mb-2">
                🌸 Flower Girls &amp; Ring Bearers 💍
              </h2>
              <p className="text-ivory/50 text-center text-sm mb-8">
                Our littlest VIPs leading the way
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {flowerGirlsAndRingBearers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={{ ...member, side: member.side ?? "special" }}
                    size="small"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Other Special Members */}
        {otherSpecial.length > 0 && (
          <>
            <SectionDivider />
            <div className="mb-16">
              <h2 className="heading-gold text-3xl text-center mb-2">
                Special Members
              </h2>
              <p className="text-ivory/50 text-center text-sm mb-8">
                Other special roles in our celebration
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {otherSpecial.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={{ ...member, side: "special" }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
