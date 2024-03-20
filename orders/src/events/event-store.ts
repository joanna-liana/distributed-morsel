import { EventStoreDBClient } from '@eventstore/db-client';

export const eventStore = new EventStoreDBClient(
  { endpoint: 'eventstore:2113' },
  { insecure: true },
);
