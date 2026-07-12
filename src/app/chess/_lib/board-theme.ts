export const STARTING_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const getBoardSquareStyles = (isDark: boolean) => ({
  lightSquareStyle: {
    backgroundColor: isDark ? '#4a4844' : '#f5f5f4'
  },
  darkSquareStyle: {
    backgroundColor: isDark ? '#2d2b28' : '#78716c'
  }
})

export const NAG_SYMBOLS: Record<number, string> = {
  1: '!',
  2: '?',
  3: '!!',
  4: '??',
  5: '!?',
  6: '?!'
}
