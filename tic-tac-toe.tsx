"use client"

import { useState, useEffect } from "react"
import { findBestMove, getEmptySquares } from "./lib/ai-logic"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

type Player = "X" | "O" | null
type BoardState = Player[]
type Difficulty = "easy" | "medium" | "hard"
type GameMode = "vs-ai" | "vs-human"

function Square({ value, onSquareClick, disabled }: { value: Player; onSquareClick: () => void; disabled: boolean }) {
  return (
    <button
      className="w-24 h-24 border border-gray-300 flex items-center justify-center text-5xl font-extrabold bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
      onClick={onSquareClick}
      disabled={disabled}
    >
      {value}
    </button>
  )
}

function Board({
  xIsNext,
  squares,
  onPlay,
  isAiTurn,
  gameMode,
}: {
  xIsNext: boolean
  squares: BoardState
  onPlay: (nextSquares: BoardState) => void
  isAiTurn: boolean
  gameMode: GameMode
}) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i] || (gameMode === "vs-ai" && isAiTurn)) {
      return
    }
    const nextSquares = squares.slice()
    if (xIsNext) {
      nextSquares[i] = "X"
    } else {
      nextSquares[i] = "O"
    }
    onPlay(nextSquares)
  }

  const winner = calculateWinner(squares)
  let status
  if (winner) {
    status = `Winner: ${winner}`
  } else if (!squares.includes(null)) {
    status = "It's a Draw!"
  } else {
    status = `Next player: ${xIsNext ? "X" : "O"}`
  }

  return (
    <Card className="w-full max-w-md bg-white shadow-lg rounded-xl dark:bg-gray-900 dark:border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">{status}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Square
              key={i}
              value={squares[i]}
              onSquareClick={() => handleClick(i)}
              disabled={(gameMode === "vs-ai" && isAiTurn) || !!squares[i] || !!winner}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Simple Confetti Effect Component
function ConfettiEffect({ show }: { show: boolean }) {
  if (!show) return null

  const colors = ["#FFC107", "#E91E63", "#9C27B0", "#2196F3", "#4CAF50", "#FF5722"]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full animate-confetti opacity-0"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Game() {
  const [history, setHistory] = useState<BoardState[]>([Array(9).fill(null)])
  const [currentMove, setCurrentMove] = useState(0)
  const [xIsNext, setXIsNext] = useState(true) // X always starts
  const [difficulty, setDifficulty] = useState<Difficulty>("hard")
  const [gameMode, setGameMode] = useState<GameMode>("vs-ai")
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)

  const { theme, setTheme } = useTheme()

  const currentSquares = history[currentMove]
  const winner = calculateWinner(currentSquares)
  const isDraw = !currentSquares.includes(null) && !winner

  useEffect(() => {
    if (gameMode === "vs-ai" && !xIsNext && !winner && !isDraw) {
      // It's AI's turn
      setIsAiThinking(true)
      const timer = setTimeout(() => {
        let aiMove: number
        const emptySquares = getEmptySquares(currentSquares)

        if (emptySquares.length === 0) {
          setIsAiThinking(false)
          return // No moves left
        }

        if (difficulty === "easy") {
          if (Math.random() < 0.5) {
            aiMove = emptySquares[Math.floor(Math.random() * emptySquares.length)]
          } else {
            aiMove = findBestMove(currentSquares.slice())
          }
        } else if (difficulty === "medium") {
          if (Math.random() < 0.2) {
            aiMove = emptySquares[Math.floor(Math.random() * emptySquares.length)]
          } else {
            aiMove = findBestMove(currentSquares.slice())
          }
        } else {
          aiMove = findBestMove(currentSquares.slice())
        }

        if (aiMove !== -1) {
          const nextSquares = currentSquares.slice()
          nextSquares[aiMove] = "O" // AI is always 'O'
          handlePlay(nextSquares)
        }
        setIsAiThinking(false)
      }, 700) // Simulate thinking time
      return () => clearTimeout(timer)
    }
  }, [xIsNext, currentSquares, winner, isDraw, difficulty, gameMode])

  useEffect(() => {
    if (winner || isDraw) {
      setShowResultDialog(true)
    }
  }, [winner, isDraw])

  function handlePlay(nextSquares: BoardState) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
    setXIsNext(!xIsNext) // Toggle turn
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove)
    setXIsNext(nextMove % 2 === 0)
    setShowResultDialog(false) // Close dialog if jumping back in history
  }

  function resetGame() {
    setHistory([Array(9).fill(null)])
    setCurrentMove(0)
    setXIsNext(true)
    setIsAiThinking(false)
    setShowResultDialog(false)
  }

  const moves = history.map((squares, move) => {
    let description
    if (move > 0) {
      description = `Go to move #${move}`
    } else {
      description = "Go to game start"
    }
    return (
      <li key={move} className="mb-2">
        <Button
          onClick={() => jumpTo(move)}
          disabled={currentMove === move}
          variant={currentMove === move ? "default" : "outline"}
          className="w-full justify-start text-left dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 dark:bg-gray-800"
        >
          {description}
        </Button>
      </li>
    )
  })

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-8 dark:from-gray-950 dark:to-gray-800">
      <ConfettiEffect show={showResultDialog && (winner || isDraw)} />

      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          {theme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </div>

      <h1 className="text-5xl font-extrabold text-gray-900 mb-10 drop-shadow-md dark:text-gray-50">Tic-Tac-Toe</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <div className="game-board flex-1 flex justify-center">
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
            isAiTurn={isAiThinking}
            gameMode={gameMode}
          />
        </div>

        <Card className="game-info w-full md:w-80 bg-white shadow-lg rounded-xl dark:bg-gray-900 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Game Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="mb-6">
              <Label htmlFor="game-mode" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Select Game Mode:
              </Label>
              <Tabs value={gameMode} onValueChange={(value) => setGameMode(value as GameMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
                  <TabsTrigger
                    value="vs-ai"
                    className="dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:text-gray-300"
                  >
                    Vs. Computer
                  </TabsTrigger>
                  <TabsTrigger
                    value="vs-human"
                    className="dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:text-gray-300"
                  >
                    Vs. Human
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {gameMode === "vs-ai" && (
              <div className="mb-6">
                <Label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  AI Difficulty:
                </Label>
                <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
                  <SelectTrigger
                    id="difficulty"
                    className="w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={resetGame}
              className="w-full mb-6 bg-green-600 hover:bg-green-700 text-white text-lg py-6 dark:bg-green-700 dark:hover:bg-green-800"
            >
              Reset Game
            </Button>

            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Game History</h3>
            <ol className="list-none p-0 max-h-60 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              {moves}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center dark:text-gray-100">
              {winner ? `Player ${winner} Wins!` : "It's a Draw!"}
            </DialogTitle>
            <DialogDescription className="text-center text-lg dark:text-gray-300">
              {winner ? "Congratulations!" : "Good game!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button
              onClick={resetGame}
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// This function is intentionally kept outside the component to avoid re-creation on re-renders
function calculateWinner(squares: BoardState): Player {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}
