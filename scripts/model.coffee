# Take a parameter colors:int, return an int 0 <= ret < colors
randomizers =
  mathRandom: (colors) -> Math.floor(Math.random()*colors)
  constantZero: (colors) -> 0

keyPegs =
  white: 'white'
  black: 'black'

# Take solution:int[] and guess:int[] parameters, return {keyPegs[...]:<integer>, solved:<bool>}
evaluators =
  original: (solution, guess) ->
    ret = {}
    ret[keyPegs.white] = 0
    ret[keyPegs.black] = 0

    for color, solutionPos in solution
      if guess[solutionPos] == color
        ret[keyPegs.black] += 1
        guess[solutionPos] = solution[solutionPos] = -1 # Prevent this peg from being used again in this evaluation
    for color, solutionPos in solution
      if color == -1 then continue
      if (guessPos = guess.indexOf color) != -1
        ret[keyPegs.white] += 1
        guess[guessPos] = -1 # Prevent this peg from being used again in this evaluation

    ret.solved = (ret[keyPegs.black] == solution.length)
    ret


class Game
  @states =
    initial: 'initial'
    playing: 'playiing'
    won: 'won'
    lost: 'lost'

  constructor: (opts) ->
    @colors = opts.colors ? 6
    @rows   = opts.rows ? 10
    @holes  = opts.holes ? 4

    @state = Game.states.initial

    @randomizer = opts.randomizer ? randomizers.mathRandom
    @evaluator = opts.evaluator ? evaluators.original

  makeCode: -> 
    throw 'makeCode must be called in "initial" state' unless @state == Game.states.initial
    @code = (@randomizer @colors for hole in [0...@holes])
    @guesses = 0
    @state = Game.states.playing

  guess: (guess) ->
    throw 'The game is over, you can\'t make any more guesses.' unless @state == Game.states.playing
    throw 'All holes must be filled in the guess.' unless guess.length == @holes
    result = @evaluator @code.slice(0, @code.length), guess.slice(0, guess.length)
    @guesses += 1
    if result.solved
      @state = Game.states.won
    else if @guesses == @rows
      @state = Game.states.lost
    result