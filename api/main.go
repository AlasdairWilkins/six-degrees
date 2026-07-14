package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func main() {
	godotenv.Load()
	tmdbClient := NewTmdbClient()

	// HandleFuncWithCors("/api/chain", )
	HandleFuncWithCors("/api/tmdb/search/person", tmdbClient.Handler)
	HandleFuncWithCors("/api/tmdb/search/movie", tmdbClient.Handler)
	HandleFuncWithCors("/api/tmdb/person/{person_id}/movie_credits", tmdbClient.Handler)
	HandleFuncWithCors("/api/tmdb/movie/{id}/credits", tmdbClient.Handler)

	HandleFuncWithCors("/health", healthHandler)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
