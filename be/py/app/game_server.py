from flask import jsonify

class GameServer:
    def games(self):
        # TODO: Fix this data so it is not hardcoded, and is the right shape
        # that the frontend expects
        games = [
            {"name": "Game 1", "question_count": 5, "status": "countdown"},
            {"name": "John's Game", "question_count": 3, "status": "waiting"},
            {"name": "Unnamed Game", "question_count": 6, "status": "ended"},
        ]
        return jsonify(games), 200
