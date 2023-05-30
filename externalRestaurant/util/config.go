package util

import (
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	ServerAddress    string `mapstructure:"SERVER_ADDRESS"`
	OTelServiceName  string `mapstructure:"OTEL_SERVICE_NAME"`
	OTelCollectorURL string `mapstructure:"OTEL_EXPORTER_OTLP_ENDPOINT"`
}

func LoadConfig(path string) (config Config, err error) {
	viper.AddConfigPath(path)

	if os.Getenv("ENV") == "production" {
		viper.SetConfigName("docker")
	} else {
		viper.SetConfigName("local")
	}

	viper.SetConfigType("env")

	viper.AutomaticEnv()

	err = viper.ReadInConfig()

	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)

	if err != nil {
		return
	}

	return
}
