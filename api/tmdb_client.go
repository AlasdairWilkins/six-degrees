package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type Method string

type TmdbClient struct {
	apiUrl     string
	readToken  string
	httpClient *http.Client
}

func NewTmdbClient() *TmdbClient {
	tmdbReadToken, keyExists := os.LookupEnv("TMDB_READ_TOKEN")
	tmdbAPIUrl, urlExists := os.LookupEnv("TMDB_API_URL")

	if !keyExists {
		log.Fatal("TMDB_READ_TOKEN environment variable is not set")
	}

	if !urlExists {
		log.Fatal("TMDB_API_URL environment variable is not set")
	}

	return &TmdbClient{
		apiUrl:     tmdbAPIUrl,
		readToken:  tmdbReadToken,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

type TmdbGetResponse struct {
	Body       []byte
	StatusCode int
	Header     http.Header
}

func (tmdbClient *TmdbClient) Get(url string) (TmdbGetResponse, error) {
	req, reqErr := http.NewRequest(http.MethodGet, strings.Join([]string{tmdbClient.apiUrl, url}, "/"), nil)
	if reqErr != nil {
		return TmdbGetResponse{}, reqErr
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tmdbClient.readToken)
	res, resErr := tmdbClient.httpClient.Do(req)
	if resErr != nil {
		return TmdbGetResponse{}, resErr
	}
	defer res.Body.Close()

	bodyBytes, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		return TmdbGetResponse{}, readErr
	}

	return TmdbGetResponse{Body: bodyBytes, StatusCode: res.StatusCode, Header: res.Header}, nil
}

func (tmdbClient *TmdbClient) Relay(w http.ResponseWriter, method Method, url string) error {
	resp, respErr := tmdbClient.Get(url)

	if respErr != nil {
		return respErr
	}

	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.WriteHeader(resp.StatusCode)
	_, writeErr := w.Write(resp.Body)
	return writeErr
}

func (tmdbClient *TmdbClient) Handler(w http.ResponseWriter, r *http.Request) {
	method := Method(r.Method)

	if method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	url := r.URL.Path[len("/api/tmdb/"):] // Extract the URL path after "/api/tmdb/"

	query := r.URL.RawQuery

	if err := tmdbClient.Relay(w, http.MethodGet, strings.Join([]string{url, query}, "?")); err != nil {
		log.Printf("tmdb relay failed: %v", err)
	}

}
