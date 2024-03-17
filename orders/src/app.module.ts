import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { HttpModule } from '@nestjs/axios';
import { eventStore } from './event-store';
import { FORWARDS, START } from '@eventstore/db-client';
import { CART_ITEMS_STREAM } from './cart-items-events';

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
        `Cart items changed: ${JSON.stringify(
          (event.event.data as { itemIds: string[] }).itemIds,
        )}`,
      );
    });
  }
}
