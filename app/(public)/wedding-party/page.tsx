import prisma from "@/lib/db";
import SectionDivider from "@/components/SectionDivider";

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

export default async function WeddingPartyPage() {
  const bridesmaids = await prisma.weddingPartyMember.findMany({
    where: { side: "bride" },
    orderBy: { sortOrder: "asc" },
  });

  const groomsmen = await prisma.weddingPartyMember.findMany({
    where: { side: "groom" },
    orderBy: { sortOrder: "asc" },
  });

  const special = await prisma.weddingPartyMember.findMany({
    where: { side: "special" },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">
            Wedding Party
          </h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            The amazing people standing by our side on our special day
          </p>
        </div>

        {/* Bridesmaids */}
        <div className="mb-16">
          <h2 className="heading-gold text-3xl text-center mb-8">
            The Bride&apos;s Side
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {bridesmaids.map((member: WPMember) => (
              <div
                key={member.id}
                className="card-celestial text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-royal/50 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">✨</span>
                  )}
                </div>
                <h3 className="text-gold font-serif text-lg mb-1">
                  {member.name}
                </h3>
                <p className="text-ivory/50 text-xs uppercase tracking-wider mb-2">
                  {member.role}
                </p>
                {member.relationToBrideOrGroom && (
                  <p className="text-ivory/40 text-xs italic mb-2">
                    {member.relationToBrideOrGroom}
                  </p>
                )}
                {member.bio && (
                  <p className="text-ivory/60 text-sm">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* Groomsmen */}
        <div className="mb-16">
          <h2 className="heading-gold text-3xl text-center mb-8">
            The Groom&apos;s Side
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {groomsmen.map((member: WPMember) => (
              <div
                key={member.id}
                className="card-celestial text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-royal/50 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">⭐</span>
                  )}
                </div>
                <h3 className="text-gold font-serif text-lg mb-1">
                  {member.name}
                </h3>
                <p className="text-ivory/50 text-xs uppercase tracking-wider mb-2">
                  {member.role}
                </p>
                {member.relationToBrideOrGroom && (
                  <p className="text-ivory/40 text-xs italic mb-2">
                    {member.relationToBrideOrGroom}
                  </p>
                )}
                {member.bio && (
                  <p className="text-ivory/60 text-sm">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Special Members (Flower Girl, Ring Bearers) */}
        {special.length > 0 && (
          <>
            <SectionDivider />
            <div className="mb-16">
              <h2 className="heading-gold text-3xl text-center mb-8">
                Special Members
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {special.map((member: WPMember) => (
                  <div
                    key={member.id}
                    className="card-celestial text-center group hover:scale-105 transition-transform duration-300"
                  >
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-royal/50 border-2 border-gold/30 flex items-center justify-center overflow-hidden">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🌟</span>
                      )}
                    </div>
                    <h3 className="text-gold font-serif text-base mb-1">
                      {member.name}
                    </h3>
                    <p className="text-ivory/50 text-xs uppercase tracking-wider mb-1">
                      {member.role}
                    </p>
                    {member.relationToBrideOrGroom && (
                      <p className="text-ivory/40 text-xs italic">
                        {member.relationToBrideOrGroom}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
