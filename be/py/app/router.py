from .game_server import GameServer

def register_routes(app, game_server: GameServer):
    @app.route('/games', methods=['GET'])
    def games():
        return game_server.games()
