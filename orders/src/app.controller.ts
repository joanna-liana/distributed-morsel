import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

interface AdjustCartItemsDto {
  itemIds: string[];
}

@Controller('cart')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Patch()
  adjustCartItems(@Body() { itemIds }: AdjustCartItemsDto) {
    console.log('added items:', itemIds);
  }

  @Post('checkout')
  checkOutCart() {
    console.log('cart checked out!');
  }
}
