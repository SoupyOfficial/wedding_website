type EventHandler<T = unknown> = (payload: T) => Promise<void> | void;

class EventBus {
  private handlers = new Map<string, EventHandler<unknown>[]>();

  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const existing = this.handlers.get(event) || [];
    existing.push(handler as EventHandler<unknown>);
    this.handlers.set(event, existing);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(event) || [];
      const index = handlers.indexOf(handler as EventHandler<unknown>);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    const handlers = this.handlers.get(event) || [];
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(`Event handler error for "${event}":`, error);
        }
      })
    );
  }

  off(event: string): void {
    this.handlers.delete(event);
  }

  listenerCount(event: string): number {
    return (this.handlers.get(event) || []).length;
  }
}

// Singleton event bus
export const eventBus = new EventBus();

// Standard event types
export interface RsvpSubmittedPayload {
  guestId: string;
  status: string;
  guestName: string;
  details: Record<string, unknown>;
}

export interface GuestCreatedPayload {
  guestId: string;
  firstName: string;
  lastName: string;
}

export interface PhotoUploadedPayload {
  photoId: string;
  category: string;
  url: string;
}

export interface SettingsUpdatedPayload {
  changedFields: string[];
}

export interface GuestBookSignedPayload {
  entryId: string;
  name: string;
  message: string;
}
