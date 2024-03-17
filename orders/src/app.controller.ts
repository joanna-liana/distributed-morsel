import { Body, Controller, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { config } from './config';
import {
  EventStoreDBClient,
  FORWARDS,
  START,
  jsonEvent,
} from '@eventstore/db-client';

const USER_ID = '123test';

interface AdjustCartItemsDto {
  itemIds: string[];
}

interface PlaceRestaurantOrderDto {
  orderId: string;
  userId: string;
  itemIds: string[];
  callbackUrl: string;
}

// ESDB client
const eventStore = new EventStoreDBClient(
  { endpoint: 'eventstore:2113' },
  { insecure: true },
);

@Controller('cart')
export class AppController {
  private cartItems: string[];

  constructor(private readonly httpService: HttpService) {}

  @Patch()
  async adjustCartItems(@Body() { itemIds }: AdjustCartItemsDto) {
    this.cartItems = itemIds.map((id) => id.toString());

    const cartItemsStream = 'cart-items-stream';

    const event = jsonEvent({
      type: 'CartItemsChanged',
      data: {
        itemIds,
      },
    });

    await eventStore.appendToStream(cartItemsStream, [event]);

    const eventStream = eventStore.readStream(cartItemsStream, {
      fromRevision: START,
      direction: FORWARDS,
    });

    for await (const { event } of eventStream) {
      console.log(
        `Cart items changed: ${JSON.stringify(
          (event.data as { itemIds: string[] }).itemIds,
        )}`,
      );
    }
  }

  @Post('checkout')
  async checkOutCart() {
    // TODO: EVENT
    console.log('cart checked out!');

    const orderId = randomUUID();

    const restaurantUrl = `${config.restaurantBaseUrl}/orders`;

    const restaurantPayload: PlaceRestaurantOrderDto = {
      orderId,
      userId: USER_ID,
      itemIds: this.cartItems,
      callbackUrl: `${config.notificationsBaseUrl}/orders/${orderId}/confirm`,
    };

    try {
      await firstValueFrom(
        this.httpService.post(restaurantUrl, restaurantPayload),
      );

      // TODO: EVENT
      console.log('order sent to restaurant');
    } catch (err) {
      // TODO: EVENT
      console.error((err as AxiosError)?.response?.data);

      throw err;
    }
  }
}
