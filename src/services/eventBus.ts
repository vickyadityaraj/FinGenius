// Simple event bus to communicate between components
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Remove subscription
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  // Emit an event
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(...args));
  }
}

// Create a singleton instance
const eventBus = new EventBus();

// Event names
export const EVENTS = {
  EXPENSE_ADDED: 'expense-added',
  EXPENSE_UPDATED: 'expense-updated',
  EXPENSE_DELETED: 'expense-deleted',
  INCOME_UPDATED: 'income-updated',
  SAVINGS_UPDATED: 'savings-updated',
  REPORT_DATA_UPDATED: 'report-data-updated',
  FINANCIAL_SCORE_UPDATED: 'financial-score-updated'
};

export default eventBus; 