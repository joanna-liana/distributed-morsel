package api

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/EventStore/EventStore-Client-Go/v4/esdb"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
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

type TestEvent struct {
	Id            string
	ImportantData string
}

func initEventStore() {
	// region createClient
	settings, err := esdb.ParseConnectionString("esdb://eventstore:2113?tls=false")

	if err != nil {
		panic(err)
	}

	db, err := esdb.NewClient(settings)

	// endregion createClient
	if err != nil {
		panic(err)
	}

	// region createEvent
	testEvent := TestEvent{
		Id:            uuid.NewString(),
		ImportantData: "I wrote my first event!",
	}

	data, err := json.Marshal(testEvent)

	if err != nil {
		panic(err)
	}

	eventData := esdb.EventData{
		ContentType: esdb.ContentTypeJson,
		EventType:   "TestEvent",
		Data:        data,
	}
	// endregion createEvent

	// region appendEvents
	_, err = db.AppendToStream(context.Background(), "some-stream", esdb.AppendToStreamOptions{}, eventData)
	// endregion appendEvents

	if err != nil {
		panic(err)
	}
}

func (server *Server) acceptOrder(ctx *gin.Context) {
	initEventStore()

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

	// TODO: make the call async
	notificationsRes, err := otelhttp.Post(
		ctx.Request.Context(),
		req.CallbackURL,
		"application/json",
		confirmCallbackBody,
	)

	if err != nil || !(notificationsRes.StatusCode >= 200 && notificationsRes.StatusCode <= 300) {
		log.Println("could not connect to the callbacks service:", err, notificationsRes.StatusCode)

		ctx.JSON(http.StatusInternalServerError, nil)

		return
	}

	ctx.JSON(http.StatusAccepted, nil)
}
