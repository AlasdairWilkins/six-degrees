package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "OK")
}

func main() {
	godotenv.Load()
	tmdbClient := NewTmdbClient()

	http.HandleFunc("/tmdb/search/person", tmdbClient.Handler)
	http.HandleFunc("/tmdb/search/movie", tmdbClient.Handler)
	http.HandleFunc("/tmdb/person/{person_id}/movie_credits", tmdbClient.Handler)
	http.HandleFunc("/tmdb/movie/{id}/credits", tmdbClient.Handler)

	http.HandleFunc("/health", healthHandler)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
