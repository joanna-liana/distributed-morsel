export const CART_ITEMS_CHANGED = 'CartItemsChanged';
export const CART_CHECKED_OUT = 'CartCheckedOut';

export type CartCommand =
  | {
      type: 'ChangeCartItems';
      data: {
        userId: string;
        itemIds: string[];
      };
    }
  | {
      type: 'CheckOutCart';
      data: {
        userId: string;
        itemIds: string[];
      };
    };
