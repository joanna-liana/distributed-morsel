import express from 'express';
const app = express();
const port = 8888;

app.post('/orders/:orderId/confirm', (req, res) => {
  console.log(`Order ${req.params.orderId} has been confirmed!`);

  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`Notifications service listening on port ${port}`);
});
