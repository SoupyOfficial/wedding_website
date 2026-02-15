export interface IEmailProvider {
  send(options: EmailSendOptions): Promise<EmailSendResult>;
  sendBatch(
    options: EmailSendOptions[]
  ): Promise<EmailSendResult[]>;
  isConfigured(): boolean;
}

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
