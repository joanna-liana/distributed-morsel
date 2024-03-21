import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import { eventStore } from './events/event-store';
import { START } from '@eventstore/db-client';
import { ORDERS_STREAM } from './events/order-events';
import { CART_STREAM } from './events/cart/cart.events';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    const cartSubscription = eventStore.subscribeToStream(CART_STREAM, {
      fromRevision: START,
    });

    cartSubscription.on('data', (event) => {
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
