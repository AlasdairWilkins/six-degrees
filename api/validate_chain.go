package main

import (
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"strconv"
	"strings"
)

type Link struct {
	ID   int    `json:"id"`
	Type string `json:"type"`
}

type ValidateChainPayload struct {
	Links          []Link `json:"links"`
	InitialActorID int    `json:"initialActorId"`
	TargetActorID  int    `json:"targetActorId"`
}

type CastMember struct {
	ID int `json:"id"`
}

type CreditsResponse struct {
	Cast []CastMember `json:"cast"`
}

type InvalidLink struct {
	PersonID int `json:"personId"`
	MovieID  int `json:"movieId"`
}

type ValidateChainResponse struct {
	InvalidLinks []InvalidLink `json:"invalidLinks"`
	IsValid      bool          `json:"isValid"`
}

func (tmdbClient *TmdbClient) ValidateChain(w http.ResponseWriter, r *http.Request) {
	var payload ValidateChainPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(payload.Links) == 0 || payload.InitialActorID != payload.Links[0].ID || payload.TargetActorID != payload.Links[len(payload.Links)-1].ID {
		http.Error(w, "Invalid links array", http.StatusUnprocessableEntity)
		return
	}

	var invalidLinks []InvalidLink

	for index, movie := range payload.Links {
		if index%2 == 0 {
			continue
		}

		var fromActor Link = payload.Links[index-1]
		var toActor Link = payload.Links[index+1]

		if index+1 >= len(payload.Links) ||
			!(fromActor.Type == "person" && movie.Type == "movie" && toActor.Type == "person") {
			http.Error(w, "Invalid links array", http.StatusUnprocessableEntity)
			return
		}

		resp, respErr := tmdbClient.Get(strings.Join([]string{"movie", strconv.Itoa(movie.ID), "credits"}, "/"))

		if respErr != nil {
			http.Error(w, respErr.Error(), http.StatusBadGateway)
			return
		}

		if resp.StatusCode != http.StatusOK {
			log.Println(resp.StatusCode, string(resp.Body))

			if resp.StatusCode == http.StatusNotFound {
				http.Error(w, "Invalid links array", http.StatusUnprocessableEntity)
				return
			}

			if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
				http.Error(w, "Invalid token", http.StatusInternalServerError)
				return
			}

			http.Error(w, "Third-party server error", http.StatusBadGateway)
			return
		}

		var credits CreditsResponse
		if err := json.Unmarshal(resp.Body, &credits); err != nil {
			http.Error(w, "Third-party server error", http.StatusBadGateway)
			return
		}

		hasActor := func(actorID int) bool {
			return slices.ContainsFunc(credits.Cast, func(castMember CastMember) bool {
				return castMember.ID == actorID
			})
		}

		if !hasActor(fromActor.ID) {
			invalidLinks = append(invalidLinks, InvalidLink{PersonID: fromActor.ID, MovieID: movie.ID})
		}

		if !hasActor(toActor.ID) {
			invalidLinks = append(invalidLinks, InvalidLink{PersonID: toActor.ID, MovieID: movie.ID})
		}
	}

	var respBody = ValidateChainResponse{
		IsValid:      len(invalidLinks) == 0,
		InvalidLinks: invalidLinks,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(respBody)
}
