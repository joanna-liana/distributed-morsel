import { Body, Controller, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { randomUUID } from 'crypto';
import { config } from './config';

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
  adjustCartItems(@Body() { itemIds }: AdjustCartItemsDto) {
    this.cartItems = itemIds.map((id) => id.toString());

    console.log('added items:', this.cartItems);
  }

  @Post('checkout')
  async checkOutCart() {
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

      console.log('order sent to restaurant');
    } catch (err) {
      console.error((err as AxiosError)?.response?.data);

      throw err;
    }
  }
}
