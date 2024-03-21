export const CART_ITEMS_CHANGED = 'CartItemsChanged';
export const CART_CHECKED_OUT = 'CartCheckedOut';

export const CART_STREAM = 'cart-stream';

export type CartEvent =
  | {
      type: 'CartItemsChanged';
      data: {
        userId: string;
        itemIds: string[];
      };
    }
  | {
      type: 'CartCheckedOut';
      data: {
        userId: string;
        itemIds: string[];
      };
    };
