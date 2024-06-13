package com.pulley.captrivia.resources;

import com.google.common.collect.ImmutableList;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/games")
@Produces(MediaType.APPLICATION_JSON)
public class GameResource {

    // TODO: Fix this so that the data is not hardcoded and is in the right
    // shape that the frontend expects
    @GET
    public List<GameEntry> getGames() {
        List<GameEntry> games = ImmutableList.of(
            new GameEntry("Game 1", 5, "countdown"),
            new GameEntry("John's Game", 3, "waiting"),
            new GameEntry("Unnamed Game", 5, "ended")
        );

        return games;
    }

    // TODO: This class should probably be moved somewhere else
    public class GameEntry {
        private String name;
        private int questionCount;
        private String status;

        public GameEntry(String name, int questionCount, String status) {
            this.name = name;
            this.questionCount = questionCount;
            this.status = status;
        }

        public String getName() {
            return name;
        }

        public int getQuestionCount() {
            return questionCount;
        }

        public String getStatus() {
            return status;
        }
    }
}
