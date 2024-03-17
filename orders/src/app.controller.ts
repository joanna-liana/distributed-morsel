import { Body, Controller, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { config } from './config';
import { jsonEvent } from '@eventstore/db-client';
import { eventStore } from './event-store';
import { CART_ITEMS_CHANGED, CART_ITEMS_STREAM } from './cart-items-events';

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

  constructor(private readonly httpService: HttpService) {}

  @Patch()
  async adjustCartItems(@Body() { itemIds }: AdjustCartItemsDto) {
    this.cartItems = itemIds.map((id) => id.toString());

    const event = jsonEvent({
      type: CART_ITEMS_CHANGED,
      data: {
        itemIds,
      },
    });

    await eventStore.appendToStream(CART_ITEMS_STREAM, [event]);
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
