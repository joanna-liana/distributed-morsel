package api

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
)

type newOrderRequest struct {
	UserID      string   `json:"userId" binding:"required"`
	OrderID     string   `json:"orderId" binding:"required"`
	ItemIDs     []string `json:"itemIDs" binding:"required"`
	CallbackURL string   `json:"callbackUrl" binding:"required"`
}

type confirmOrderParams struct {
	OrderID          string `json:"userId" binding:"required"`
	EstimatedArrival string `json:"estimatedArrival" binding:"required"`
}

func (server *Server) acceptOrder(ctx *gin.Context) {
	var req newOrderRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		log.Println("request error:", err)

		// TODO: yes, bad for security to return any error like that
		ctx.JSON(http.StatusBadRequest, errorResponse(err))

		return
	}

	marshalledConfirmParams, err := json.Marshal(confirmOrderParams{
		OrderID:          req.OrderID,
		EstimatedArrival: time.Now().Add(time.Hour).UTC().String(),
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, nil)

		return
	}

	confirmCallbackBody := bytes.NewBuffer(marshalledConfirmParams)

	// Create an HTTP client with the new context
	client := http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)}

	// Extract the OTel span from the context
	span := trace.SpanFromContext(ctx.Request.Context())

	// Create a new context with the OTel span propagated
	otelCtx := trace.ContextWithSpan(context.Background(), span)

	notificationsReq, err := http.NewRequestWithContext(
		otelCtx,
		"POST",
		req.CallbackURL,
		confirmCallbackBody,
	)

	otel.GetTextMapPropagator().Inject(ctx, propagation.HeaderCarrier(notificationsReq.Header))

	if err != nil {
		log.Println("could not create the request to the callbacks service:", err)

		ctx.JSON(http.StatusInternalServerError, nil)

		return
	}

	// TODO: make the call async
	notificationsRes, err := client.Do(notificationsReq)

	if err != nil || !(notificationsRes.StatusCode >= 200 && notificationsRes.StatusCode <= 300) {
		log.Println("could not connect to the callbacks service:", err, notificationsRes.StatusCode)

		ctx.JSON(http.StatusInternalServerError, nil)

		return
	}

	ctx.JSON(http.StatusAccepted, nil)
}
