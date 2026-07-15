package main

import (
	"log"
	"net/http"
	"os"
	"strings"
)

func withCORs(next http.HandlerFunc) http.HandlerFunc {
	appUrl, appUrlExists := os.LookupEnv("APP_URL")

	if !appUrlExists {
		log.Fatal("APP_URL environment variable is not set")
	}

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", appUrl)
		w.Header().Set("Access-Control-Allow-Methods", strings.Join([]string{http.MethodGet, http.MethodPost, http.MethodOptions}, ", "))
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func HandleFuncWithCors(path string, handlerFunc http.HandlerFunc) {
	http.HandleFunc(path, withCORs(handlerFunc))
}
