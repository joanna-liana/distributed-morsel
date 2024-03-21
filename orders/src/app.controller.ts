import { Body, Controller, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { config } from './config';
import { jsonEvent } from '@eventstore/db-client';
import { eventStore } from './events/event-store';
import { CART_CHECKED_OUT, CART_STREAM } from './events/cart/cart.events';
import {
  ORDERS_STREAM,
  ORDER_PLACED,
  ORDER_PLACING_FAILED,
} from './events/order-events';
import { commandHandler } from './events/cart/cart.command-handler';

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

@Controller('cart')
export class AppController {
  private cartItems: string[];
  private readonly cartItemCommandHandler = commandHandler(eventStore);

  constructor(private readonly httpService: HttpService) {}

  @Patch()
  async adjustCartItems(@Body() { itemIds }: AdjustCartItemsDto) {
    this.cartItems = itemIds.map((id) => id.toString());

    await this.cartItemCommandHandler.handle({
      type: 'ChangeCartItems',
      data: {
        userId: USER_ID,
        itemIds,
      },
    });
  }

  @Post('checkout')
  async checkOutCart() {
    const event = jsonEvent({
      type: CART_CHECKED_OUT,
      data: {
        userId: USER_ID,
      },
    });

    await eventStore.appendToStream(CART_STREAM, [event]);

    const orderId = randomUUID();

    const restaurantUrl = `${config.restaurantBaseUrl}/orders`;

    // TODO: emit place order command

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

      const event = jsonEvent({
        type: ORDER_PLACED,
        data: {
          userId: USER_ID,
          itemIds: this.cartItems,
        },
      });

      await eventStore.appendToStream(ORDERS_STREAM, [event]);
    } catch (err) {
      const errorDetails = (err as AxiosError)?.response?.data;

      console.error(errorDetails);

      const event = jsonEvent({
        type: ORDER_PLACING_FAILED,
        data: {
          userId: USER_ID,
          itemIds: this.cartItems,
          reason: errorDetails,
        },
      });

      await eventStore.appendToStream(ORDERS_STREAM, [event]);

      throw err;
    }
  }
}
