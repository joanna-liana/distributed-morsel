package main

import (
	"context"
	"log"
	"restaurant/api"
	"restaurant/util"
	"sync"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"

	sdkresource "go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

var initResourcesOnce sync.Once
var resource *sdkresource.Resource

func initResource(serviceName string) *sdkresource.Resource {
	initResourcesOnce.Do(func() {
		extraResources, _ := sdkresource.New(
			context.Background(),
			sdkresource.WithOS(),
			sdkresource.WithProcess(),
			sdkresource.WithContainer(),
			sdkresource.WithHost(),
			sdkresource.WithAttributes(semconv.ServiceNameKey.String(serviceName)),
		)
		resource, _ = sdkresource.Merge(
			sdkresource.Default(),
			extraResources,
		)
	})
	return resource
}

func initTracerProvider(config util.Config) (*sdktrace.TracerProvider, error) {
	ctx := context.Background()

	var (
		serviceName  = config.OTelServiceName
		collectorURL = config.OTelCollectorURL
	)

	exporter, err := otlptrace.New(
		ctx,
		otlptracegrpc.NewClient(
			otlptracegrpc.WithInsecure(),
			otlptracegrpc.WithEndpoint(collectorURL),
		))

	if err != nil {
		return nil, err
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(initResource(serviceName)),
	)

	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	return tp, nil
}

func main() {
	config, err := util.LoadConfig(".")

	if err != nil {
		log.Fatal("cannot read config", err)
	}

	tp, err := initTracerProvider(config)
	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	server := api.NewServer(config.OTelServiceName)

	err = server.Start(config.ServerAddress)

	if err != nil {
		log.Fatal("cannot start server", err)
	}
}
