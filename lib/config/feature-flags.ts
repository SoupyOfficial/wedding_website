import prisma from "@/lib/db";

export interface FeatureFlags {
  rsvpEnabled: boolean;
  guestBookEnabled: boolean;
  photoUploadEnabled: boolean;
  registrySyncEnabled: boolean;
  songRequestsEnabled: boolean;
  entertainmentPageEnabled: boolean;
  guestPhotoSharingEnabled: boolean;
  liveGuestCountEnabled: boolean;
  massEmailEnabled: boolean;
  [key: string]: boolean;
}

const defaultFlags: FeatureFlags = {
  rsvpEnabled: true,
  guestBookEnabled: true,
  photoUploadEnabled: false,
  registrySyncEnabled: false,
  songRequestsEnabled: true,
  entertainmentPageEnabled: true,
  guestPhotoSharingEnabled: false,
  liveGuestCountEnabled: false,
  massEmailEnabled: true,
};

export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    const flags = await prisma.featureFlag.findMany();
    const result = { ...defaultFlags };

    for (const flag of flags) {
      result[flag.key] = flag.enabled;
    }

    return result;
  } catch {
    return defaultFlags;
  }
}

export async function getFeatureFlag(key: string): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });
    return flag?.enabled ?? defaultFlags[key] ?? false;
  } catch {
    return defaultFlags[key] ?? false;
  }
}

export async function setFeatureFlag(
  key: string,
  enabled: boolean
): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled },
    create: { key, enabled },
  });
}
