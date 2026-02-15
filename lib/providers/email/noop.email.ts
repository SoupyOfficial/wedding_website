import type {
  IEmailProvider,
  EmailSendOptions,
  EmailSendResult,
} from "./email.provider";

/**
 * No-Op email provider that logs emails but doesn't send them.
 * Used when no email service is configured.
 */
export class NoOpEmailProvider implements IEmailProvider {
  async send(options: EmailSendOptions): Promise<EmailSendResult> {
    console.log(
      `[NoOpEmail] Would send to: ${options.to}, subject: "${options.subject}"`
    );
    return { success: true, messageId: `noop-${Date.now()}` };
  }

  async sendBatch(
    options: EmailSendOptions[]
  ): Promise<EmailSendResult[]> {
    return Promise.all(options.map((opt) => this.send(opt)));
  }

  isConfigured(): boolean {
    return false;
  }
}
