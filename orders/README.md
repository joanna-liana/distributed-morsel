# Orders

The client-facing food delivery app.

## Setup
To start, run `npm start` or `npm run start dev` (the watch mode).
If it's your first town around, Make sure to install the packages with `npm ci`.

To see how the distributing tracing looks like, run `docker-compose up` in the root of this repo. It will start Jaeger (the "tracing browser") at `http://localhost:16686`.

Remember to start `notifications` and `externalRestaurant` too (TODO: add compose).

The service traces in Jaeger will show up after running the demo 👇

Service names in Jaeger:
- `dm-orders`
- `dm-restaurant`
- `dm-notifications`

## Demo

You can execute the flow by running to requests:
1. Set some items in your cart:
```
PATCH http://localhost:3000/cart
{
    "itemIds": [1,2]
}
```
2. Check out your cart to create the order:
```
POST http://localhost:3000/cart/checkout
<no payload>
```

The app will then call the restaurant, which will in turn confirm the order by calling the notifications service.
