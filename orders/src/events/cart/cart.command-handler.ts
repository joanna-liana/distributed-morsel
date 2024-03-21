import { EventStoreDBClient, jsonEvent } from '@eventstore/db-client';
import { CartCommand } from './cart.commands';
import { decide } from './cart.decide';
import { CART_STREAM } from './cart.events';

// TODO: make generic
export const commandHandler = (eventStore: EventStoreDBClient) => ({
  handle: async (command: CartCommand) => {
    const event = decide(command);

    await eventStore.appendToStream(CART_STREAM, [jsonEvent(event)]);
  },
});
