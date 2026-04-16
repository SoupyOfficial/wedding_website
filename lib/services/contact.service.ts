import { execute, generateId, now } from "@/lib/db";

/**
 * Submit a contact message.
 * Truncates fields to safe lengths.
 */
export async function submitMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await execute(
    "INSERT INTO ContactMessage (id, name, email, subject, message, isRead, createdAt) VALUES (?, ?, ?, ?, ?, 0, ?)",
    [
      generateId(),
      input.name.trim().slice(0, 100),
      input.email.trim().slice(0, 200),
      input.subject.trim().slice(0, 200),
      input.message.trim().slice(0, 2000),
      now(),
    ]
  );
}
