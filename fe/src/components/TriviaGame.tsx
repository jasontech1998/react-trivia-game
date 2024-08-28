import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useGames } from "../hooks/useGames";
import {
  Game,
  GameJoinedPayload,
  QuestionPayload,
  CorrectAnswerPayload,
  GameEndPayload,
  Score,
} from "../types";
import ConnectionForm from "./ConnectionForm";
import CreateGameForm from "./CreateGameForm";
import GameList from "./GameList";
import WaitingRoom from "./WaitingRoom";
import GameInfo from "./GameInfo";
import GameOverDisplay from "./GameOverDisplay";

const TriviaGame: React.FC = () => {
  // Custom hooks
  const {
    games,
    setGames,
    isLoading,
    error: apiError,
    fetchGames,
  } = useGames();

  // useRef hooks
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // useState hooks
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionPayload | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [lastCorrectPlayer, setLastCorrectPlayer] = useState<string | null>(
    null
  );
  const [gameMessages, setGameMessages] = useState<string[]>([]);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const [leavingCountdown, setLeavingCountdown] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = handleMessage;
    }
  }, [wsRef.current]);

  useEffect(() => {
    if (timeLeft === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [timeLeft]);

  // Connection Management
  const handleConnect = (name: string) => {
    if (!name.trim()) {
      setError("Please enter a player name");
      return;
    }

    if (isConnected) {
      handleDisconnect();
      return;
    }

    const ws = new WebSocket(
      `ws://localhost:8080/connect?name=${encodeURIComponent(name)}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "connection_success") {
        setIsConnected(true);
        setPlayerName(name);
        setError(null);
      } else if (data.type === "name_taken") {
        setError(data.message);
        ws.close();
      } else {
        handleMessage(event);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to the server");
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      if (event.code === 1008) {
        setError(event.reason || "Connection closed due to name issue");
      }
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setPlayerName("");
    setCurrentGame(null);
    setPlayers([]);
    setScores([]);
    setIsLeader(false);
    setGameMessages([]);
    setError(null);
  };

  // Game Management
  const handleCreateGame = (gameName: string, questionCount: number) => {
    if (!isConnected) {
      setError("Please connect to the server first");
      return;
    }
    const createCommand = {
      nonce: Date.now().toString(),
      type: "create",
      payload: {
        name: gameName,
        question_count: questionCount,
      },
    };
    wsRef.current?.send(JSON.stringify(createCommand));
  };

  const handleJoinGame = (gameId: string) => {
    if (!isConnected) {
      setError("Please connect to the server first");
      return;
    }
    const joinCommand = {
      nonce: Date.now().toString(),
      type: "join",
      payload: { gameId },
    };
    wsRef.current?.send(JSON.stringify(joinCommand));
  };

  const handleStartGame = () => {
    if (!currentGame || currentGame.playerNames.length < 2) return;
    const startCommand = {
      nonce: Date.now().toString(),
      type: "start",
      payload: { gameId: currentGame.id },
    };
    wsRef.current?.send(JSON.stringify(startCommand));
  };

  const handleReturnToLobby = () => {
    if (currentGame) {
      const leaveCommand = {
        nonce: Date.now().toString(),
        type: "leave",
        payload: { gameId: currentGame.id },
      };
      wsRef.current?.send(JSON.stringify(leaveCommand));
    }
    setCurrentGame(null);
    setPlayers([]);
    setScores([]);
    setIsLeader(false);
    setGameMessages([]);
    setError(null);
    setLeavingCountdown(null);

    // Fetch the updated game list
    fetchGames();
  };

  const handleDestroyGame = () => {
    if (!currentGame) return;
    const destroyCommand = {
      nonce: Date.now().toString(),
      type: "destroy",
      payload: { gameId: currentGame.id },
    };
    wsRef.current?.send(JSON.stringify(destroyCommand));
  };

  // Gameplay
  const handleAnswer = (answer: string) => {
    if (!currentGame || !currentQuestion) return;
    const answerCommand = {
      nonce: Date.now().toString(),
      type: "answer",
      payload: { gameId: currentGame.id, answer },
    };
    wsRef.current?.send(JSON.stringify(answerCommand));
    setSelectedAnswer(answer);
  };

  // Visual Effects
  const shootConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const celebrateWinner = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  // Message Handling
  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    console.log("Received message:", data);

    switch (data.type) {
      case "game_create":
        setGames((prevGames) => [
          ...prevGames,
          {
            id: data.payload.id,
            name: data.payload.name,
            questionCount: data.payload.questionCount,
            playerCount: data.payload.playerCount,
            playerNames: data.payload.playerNames,
            state: data.payload.state,
          },
        ]);
        break;
      case "game_joined":
        const gameJoinedPayload = data.payload as GameJoinedPayload;
        setCurrentGame({
          id: gameJoinedPayload.id,
          name: gameJoinedPayload.name,
          questionCount: gameJoinedPayload.questionCount,
          playerCount: gameJoinedPayload.playerCount,
          playerNames: gameJoinedPayload.players,
          state: gameJoinedPayload.state,
        });
        setPlayers(gameJoinedPayload.players);
        setIsLeader(gameJoinedPayload.players[0] === playerName);
        setGames((prevGames) =>
          prevGames.filter((g) => g.id !== gameJoinedPayload.id)
        );
        setError(null);
        break;
      case "game_rejoined":
        setCurrentGame({
          id: data.payload.id,
          name: data.payload.name,
          questionCount: data.payload.questionCount,
          playerCount: data.payload.playerCount,
          playerNames: data.payload.players,
          state: data.payload.state,
        });
        setPlayers(data.payload.players);
        setIsLeader(data.payload.players[0] === playerName);
        break;
      case "player_joined":
        setPlayers(data.payload.players);
        setCurrentGame((prevGame) =>
          prevGame && prevGame.id === data.payload.gameId
            ? {
                ...prevGame,
                playerCount: data.payload.playerCount,
                playerNames: data.payload.players,
              }
            : prevGame
        );
        setGameMessages((prev) => [...prev, data.payload.message]);
        break;
      case "player_left":
        setPlayers(data.payload.players);
        setCurrentGame((prevGame) =>
          prevGame && prevGame.id === data.payload.gameId
            ? {
                ...prevGame,
                playerCount: data.payload.playerCount,
                playerNames: data.payload.players,
              }
            : prevGame
        );
        setGameMessages((prev) => [...prev, data.payload.message]);
        break;
      case "game_start":
        setCurrentGame((prevGame) =>
          prevGame && prevGame.id === data.payload.gameId
            ? { ...prevGame, state: "countdown" }
            : prevGame
        );
        setScores(
          data.payload.players.map((player: string) => ({
            name: player,
            score: 0,
          }))
        );
        break;
      case "countdown":
        setCountdown(data.payload.countdown);
        break;
      case "question":
        const questionPayload = data.payload as QuestionPayload;
        setCurrentQuestion(questionPayload);
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setLastCorrectPlayer(null);
        setTimeLeft(10);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        setCurrentGame((prevGame) => {
          if (prevGame && prevGame.id === questionPayload.gameId) {
            return {
              ...prevGame,
              state: "question",
              currentQuestionIndex: questionPayload.questionIndex,
              questionCount: questionPayload.totalQuestions,
            };
          }
          return prevGame;
        });
        break;
      case "reveal_answer":
        setCorrectAnswer(data.payload.correctAnswer);
        break;
      case "correct_answer":
        const correctAnswerPayload = data.payload as CorrectAnswerPayload;
        setLastCorrectPlayer(correctAnswerPayload.playerName);
        setCorrectAnswer(correctAnswerPayload.correctAnswer);
        if (timerRef.current) clearInterval(timerRef.current);
        setScores(correctAnswerPayload.scores);
        if (correctAnswerPayload.playerName === playerName) {
          shootConfetti();
        }
        break;
      case "time_up":
        setCorrectAnswer(data.payload.correctAnswer);
        setLastCorrectPlayer(null);
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      case "game_end":
        const gameEndPayload = data.payload as GameEndPayload;
        setScores(gameEndPayload.scores);
        setCurrentGame(null);
        setPlayers([]);
        setGameMessages([]);
        setIsLeader(false);
        setLeavingCountdown(5);
        if (gameEndPayload.winner === playerName) {
          celebrateWinner();
        }
        const countdownInterval = setInterval(() => {
          setLeavingCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              handleReturnToLobby();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        // Remove the ended game from the games list
        setGames((prevGames) =>
          prevGames.filter((g) => g.id !== gameEndPayload.gameId)
        );
        break;
      case "game_destroy":
        setGames((prevGames) =>
          prevGames.filter((g) => g.id !== data.payload.gameId)
        );
        if (currentGame && currentGame.id === data.payload.gameId) {
          handleReturnToLobby();
        }
        break;
      case "game_update":
        setGames((prevGames) =>
          prevGames.map((game) =>
            game.id === data.payload.id ? { ...game, ...data.payload } : game
          )
        );
        if (currentGame && currentGame.id === data.payload.id) {
          setCurrentGame((prevGame) => ({ ...prevGame, ...data.payload }));
          setPlayers(data.payload.playerNames);
        }
        break;
      case "game_destroyed":
        setError(data.payload.message);
        handleReturnToLobby();
        break;
      case "game_left":
        setCurrentGame(null);
        setPlayers([]);
        setScores([]);
        setIsLeader(false);
        setGameMessages([]);
        fetchGames();
        break;
      case "all_incorrect":
        setCorrectAnswer(data.payload.correctAnswer);
        setLastCorrectPlayer(null);
        if (timerRef.current) clearInterval(timerRef.current);
        break;
      case "games_list":
        setGames(data.payload);
        setIsLoading(false);
        break;
      case "player_connected":
      case "player_disconnected":
        setConnectedPlayers(data.payload.connectedPlayers);
        break;
      case "game_join_failed":
        setError(
          data.payload.message || "Failed to join the game. Please try again."
        );
        break;
      case "game_list_update":
        setGames(data.payload);
        setIsLoading(false);
        break;
    }
  };

  // Render helpers
  const isInGame =
    currentGame &&
    ["countdown", "question", "ended"].includes(currentGame.state);
  const isWaiting = currentGame && currentGame.state === "waiting";

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-cyan-100 p-4 flex items-center justify-center">
      <div
        className={`relative w-full max-w-4xl mx-auto transition-all duration-500 ease-in-out ${
          isInGame ? "flex flex-col sm:flex-row" : "block"
        }`}
      >
        {/* Top card - Game Info or Game Over Display */}
        <div
          className={`bg-gradient-to-r from-emerald-400 to-cyan-500 shadow-lg rounded-3xl transition-all duration-500 ease-in-out
					${isConnected ? "opacity-100" : "opacity-0 pointer-events-none"}
					${isInGame ? "w-full sm:w-1/3 mb-4 sm:mb-0 sm:mr-4" : "w-full mb-4"}`}
        >
          <div className="p-6 h-full">
            <div className="h-full overflow-y-auto">
              {isInGame ? (
                <GameInfo
                  currentGame={currentGame}
                  players={players}
                  scores={scores}
                  playerName={playerName}
                />
              ) : leavingCountdown !== null ? (
                <GameOverDisplay
                  scores={scores}
                  playerName={playerName}
                  leavingCountdown={leavingCountdown}
                />
              ) : isWaiting ? (
                <WaitingRoom
                  gameName={currentGame.name}
                  players={currentGame.playerNames || []}
                  isLeader={isLeader}
                  playerName={playerName}
                  gameMessages={gameMessages}
                  questionCount={currentGame.questionCount}
                />
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-white">
                    Available Games
                  </h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    ) : games.length === 0 ? (
                      <p className="text-white">No games available.</p>
                    ) : (
                      <GameList games={games} onJoinGame={handleJoinGame} />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main card */}
        <div
          className={`bg-white shadow-lg rounded-3xl transition-all duration-500 ease-in-out ${
            isInGame ? "w-full sm:w-2/3" : "w-full"
          }`}
        >
          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-2xl">
              <h1 className="text-4xl font-bold mb-6 text-center text-emerald-600">
                Pulley Trivia Game
              </h1>

              {apiError && (
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                  role="alert"
                >
                  <p className="font-bold">Error</p>
                  <p>{apiError}</p>
                </div>
              )}

              {error && (
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                  role="alert"
                >
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}

              {!isConnected ? (
                <ConnectionForm onConnect={handleConnect} />
              ) : (
                <div className={isInGame ? "" : "max-h-96 overflow-y-auto"}>
                  {!currentGame && scores.length > 0 ? (
                    <div className="bg-white rounded">
                      <h2 className="text-2xl font-semibold mb-4 text-emerald-600">
                        Game Over
                      </h2>
                      <h3 className="text-xl mb-2 text-cyan-500">
                        Final Scores:
                      </h3>
                      <ul className="list-disc list-inside mb-4">
                        {scores
                          .sort((a, b) => b.score - a.score)
                          .map((score, index) => (
                            <li
                              key={index}
                              className={`${
                                score.name === playerName ? "font-bold" : ""
                              } ${
                                index === 0
                                  ? "text-emerald-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {score.name}: {score.score}{" "}
                              {score.name === playerName && "(You)"}
                            </li>
                          ))}
                      </ul>
                      <p className="text-gray-600">
                        Returning to lobby in {leavingCountdown} seconds...
                      </p>
                    </div>
                  ) : !currentGame ? (
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-4 text-emerald-600">
                        Create a New Game
                      </h2>
                      <CreateGameForm onCreateGame={handleCreateGame} />
                    </div>
                  ) : (
                    <>
                      {currentGame.state === "waiting" && (
                        <div className="text-center">
                          <h2 className="text-2xl font-semibold mb-4 text-emerald-600">
                            Waiting Room: {currentGame.name}
                          </h2>
                          <p className="text-xl mb-4 text-cyan-600">
                            Number of Questions: {currentGame.questionCount}
                          </p>
                          {isLeader ? (
                            <div className="space-y-2">
                              <button
                                onClick={handleStartGame}
                                disabled={currentGame.playerNames.length < 2}
                                className={`w-full text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out
																	${
                                    currentGame.playerNames.length < 2
                                      ? "bg-gray-400 cursor-not-allowed"
                                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                  }`}
                              >
                                {currentGame.playerNames.length < 2
                                  ? "Waiting for more players"
                                  : "Start Game"}
                              </button>
                              <button
                                onClick={handleDestroyGame}
                                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                              >
                                Destroy Game
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleReturnToLobby}
                              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                            >
                              Leave Game
                            </button>
                          )}
                        </div>
                      )}

                      {currentGame.state === "countdown" && (
                        <div className="text-center">
                          <h2 className="text-2xl font-semibold mb-4 text-emerald-600">
                            Game starting in...
                          </h2>
                          <p className="text-6xl font-bold text-cyan-500">
                            {countdown}
                          </p>
                        </div>
                      )}

                      {currentGame.state === "question" && currentQuestion && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                          <h2 className="text-2xl font-semibold mb-4 text-emerald-600">
                            {currentQuestion.question}
                          </h2>
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-xl text-cyan-500">
                              Time left: {timeLeft} seconds
                            </p>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Question {currentGame.currentQuestionIndex + 1}{" "}
                                of {currentGame.questionCount}
                              </p>
                            </div>
                          </div>
                          {lastCorrectPlayer && (
                            <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-4 rounded-r-lg animate-pulse">
                              <p className="font-bold">
                                {lastCorrectPlayer} answered correctly!
                              </p>
                            </div>
                          )}
                          <ul className="space-y-2 mb-4">
                            {currentQuestion.options.map(
                              (option: string, index: number) => (
                                <li key={index}>
                                  <button
                                    onClick={() => handleAnswer(option)}
                                    className={`w-full text-left p-3 rounded-lg transition duration-300 ease-in-out
																		${
                                      selectedAnswer === option
                                        ? correctAnswer === null
                                          ? "bg-cyan-500 text-white"
                                          : correctAnswer === option
                                          ? "bg-emerald-500 text-white animate-pulse"
                                          : "bg-red-500 text-white"
                                        : correctAnswer === option
                                        ? "bg-emerald-500 text-white animate-pulse"
                                        : "bg-gray-100 hover:bg-gray-200"
                                    }
																		${
                                      selectedAnswer !== null ||
                                      correctAnswer !== null
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
																	`}
                                    disabled={
                                      selectedAnswer !== null ||
                                      correctAnswer !== null
                                    }
                                  >
                                    {option}
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                          {correctAnswer && (
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg animate-fade-in">
                              <p className="font-bold">
                                Correct Answer: {correctAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom card - Connected Players (only shown when not in game) */}
        {isConnected && !isInGame && (
          <div className="bg-gradient-to-r from-purple-400 to-indigo-500 shadow-lg rounded-3xl mt-4 p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Connected Players
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {connectedPlayers.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-lg font-semibold bg-white bg-opacity-20 rounded-md px-3 py-1 shadow-sm"
                >
                  <span>{player}</span>
                  {player === playerName && (
                    <div className="flex items-center">
                      <span className="mr-2">(You)</span>
                      <button
                        onClick={handleDisconnect}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriviaGame;
