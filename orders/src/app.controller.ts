import { Body, Controller, Patch, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { randomUUID } from 'crypto';

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

    const restaurantUrl = 'http://localhost:8080/orders';

    const restaurantPayload: PlaceRestaurantOrderDto = {
      orderId,
      userId: USER_ID,
      itemIds: this.cartItems,
      callbackUrl: `http://localhost:8888/orders/${orderId}/confirm`,
    };

    try {
      const notificationPayload = {
        OrderID: '123',
        EstimatedArrival: new Date().toISOString(),
      };

      // await firstValueFrom(
      //   this.httpService.post(
      //     restaurantPayload.callbackUrl,
      //     notificationPayload,
      //   ),
      // );

      await firstValueFrom(
        this.httpService.post(restaurantUrl, restaurantPayload),
      );

      // console.log('reach out to notifiactions');

      console.log('order sent to restaurant');
    } catch (err) {
      console.error((err as AxiosError)?.response?.data);

      throw err;
    }
  }
}
