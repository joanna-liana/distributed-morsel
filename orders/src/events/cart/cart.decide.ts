import { CartCommand } from './cart.commands';
import { CartEvent } from './cart.events';

export const decide = (command: CartCommand): CartEvent => {
  switch (command.type) {
    case 'ChangeCartItems':
      return {
        type: 'CartItemsChanged',
        data: command.data,
      };
    case 'CheckOutCart':
      return {
        type: 'CartCheckedOut',
        data: command.data,
      };
  }
};
