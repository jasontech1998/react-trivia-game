package server

import (
	"encoding/json"
	"net/http"
)

type GameServer struct {
}

func NewGameServer() *GameServer {
	return &GameServer{}
}

// Games writes the existing games to the response.
func (g *GameServer) Games(w http.ResponseWriter, r *http.Request) {
	// TODO: Fix this data so it is not hardcoded, and is the right shape
	// that the frontend expects
	games := []struct {
		Name          string
		QuestionCount int
		State         string
	}{
		{"Game 1", 5, "countdown"},
		{"John's Game", 3, "waiting"},
		{"Unnamed Game", 6, "ended"},
	}
	writeJSON(w, http.StatusOK, games)
}

func writeJSON(w http.ResponseWriter, statusCode int, obj any) error {
	b, err := json.Marshal(obj)
	if err != nil {
		return err
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	// TODO: Handle this error
	_, err = w.Write(b)
	return err
}
