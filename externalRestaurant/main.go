package main

import (
	"log"
	"restaurant/api"
	"restaurant/util"
)

func main() {
	config, err := util.LoadConfig(".")

	if err != nil {
		log.Fatal("cannot read config", err)
	}

	server := api.NewServer()

	err = server.Start(config.ServerAddress)

	if err != nil {
		log.Fatal("cannot start server", err)
	}
}
