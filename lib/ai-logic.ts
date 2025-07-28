type Player = "X" | "O" | null
type BoardState = Player[]

// Helper to check for a winner (reused from the main game logic)
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

// Minimax algorithm implementation
function minimax(board: BoardState, depth: number, isMaximizingPlayer: boolean): number {
  const winner = calculateWinner(board)

  if (winner === "X") {
    // AI wins (assuming AI is 'X' in minimax context)
    return 10 - depth
  } else if (winner === "O") {
    // Human wins (assuming Human is 'O' in minimax context)
    return depth - 10
  } else if (!board.includes(null)) {
    // Draw
    return 0
  }

  if (isMaximizingPlayer) {
    // AI's turn (maximizing player)
    let bestScore = Number.NEGATIVE_INFINITY
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = "X" // Make the move
        const score = minimax(board, depth + 1, false)
        board[i] = null // Undo the move
        bestScore = Math.max(bestScore, score)
      }
    }
    return bestScore
  } else {
    // Human's turn (minimizing player)
    let bestScore = Number.POSITIVE_INFINITY
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = "O" // Make the move
        const score = minimax(board, depth + 1, true)
        board[i] = null // Undo the move
        bestScore = Math.min(bestScore, score)
      }
    }
    return bestScore
  }
}

export function findBestMove(board: BoardState): number {
  let bestScore = Number.NEGATIVE_INFINITY
  let bestMove = -1

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = "X" // Simulate AI's move
      const score = minimax(board, 0, false) // Call minimax for the human's turn
      board[i] = null // Undo the move

      if (score > bestScore) {
        bestScore = score
        bestMove = i
      }
    }
  }
  return bestMove
}

export function getEmptySquares(board: BoardState): number[] {
  return board.map((val, idx) => (val === null ? idx : -1)).filter((idx) => idx !== -1)
}
