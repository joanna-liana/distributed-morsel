package api

import (
	"github.com/gin-gonic/gin"

	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

type Server struct {
	router *gin.Engine
}

func NewServer(serviceName string) *Server {
	server := &Server{}
	router := gin.Default()
	router.Use(otelgin.Middleware(serviceName))

	router.POST("/orders", server.acceptOrder)

	server.router = router
	return server
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
