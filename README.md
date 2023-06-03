# distributed-morsel
Distributed tracing playground using a mock food delivery app.

## Quick start
To see how the distributing tracing looks like, run `docker-compose up` in the root of this repo. It will start Jaeger (the "tracing browser") at `http://localhost:16686`.

The service traces in Jaeger will show up after running the demo 👇

Service names in Jaeger:
- `dm-orders`
- `dm-restaurant`
- `dm-notifications`

![image](jaegerScreenshot.png)

## Demo

You can execute the flow by running 2 requests:
1. Put some items in your cart:
```
curl -X PATCH \
-H "Content-Type: application/json" \
-d '{"itemIds": [1,2]}' \
http://localhost:3000/cart
```
2. Check out your cart to create the order:
```
curl -X POST \
http://localhost:3000/cart/checkout
```

The orders app will then call the restaurant, which will in turn confirm the order by calling the notifications service.
