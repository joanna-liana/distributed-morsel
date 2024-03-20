import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import { eventStore } from './events/event-store';
import { START } from '@eventstore/db-client';
import { CART_ITEMS_STREAM } from './events/cart-items-events';
import { ORDERS_STREAM } from './events/order-events';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    const cartItemsSubscription = eventStore.subscribeToStream(
      CART_ITEMS_STREAM,
      {
        fromRevision: START,
      },
    );

    cartItemsSubscription.on('data', (event) => {
      console.log(
        `[${event.event.type}] payload: ${JSON.stringify(event.event.data)}`,
      );
    });

    const ordersSubscription = eventStore.subscribeToStream(ORDERS_STREAM, {
      fromRevision: START,
    });

    ordersSubscription.on('data', (event) => {
      console.log(
        `[${event.event.type}] payload: ${JSON.stringify(event.event.data)}`,
      );
    });
  }
}
