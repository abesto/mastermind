var Game, evaluators, keyPegs, randomizers;

randomizers = {
  mathRandom: function(colors) {
    return Math.floor(Math.random() * colors);
  },
  constantZero: function(colors) {
    return 0;
  }
};

keyPegs = {
  white: 'white',
  black: 'black'
};

evaluators = {
  original: function(solution, guess) {
    var color, guessPos, ret, solutionPos, _len, _len2;
    ret = {};
    ret[keyPegs.white] = 0;
    ret[keyPegs.black] = 0;
    for (solutionPos = 0, _len = solution.length; solutionPos < _len; solutionPos++) {
      color = solution[solutionPos];
      if (guess[solutionPos] === color) {
        ret[keyPegs.black] += 1;
        guess[solutionPos] = solution[solutionPos] = -1;
      }
    }
    for (solutionPos = 0, _len2 = solution.length; solutionPos < _len2; solutionPos++) {
      color = solution[solutionPos];
      if (color === -1) continue;
      if ((guessPos = guess.indexOf(color)) !== -1) {
        ret[keyPegs.white] += 1;
        guess[guessPos] = -1;
      }
    }
    ret.solved = ret[keyPegs.black] === solution.length;
    return ret;
  }
};

Game = (function() {

  Game.states = {
    initial: 'initial',
    playing: 'playiing',
    won: 'won',
    lost: 'lost'
  };

  function Game(opts) {
    var _ref, _ref2, _ref3, _ref4, _ref5;
    this.colors = (_ref = opts.colors) != null ? _ref : 6;
    this.rows = (_ref2 = opts.rows) != null ? _ref2 : 10;
    this.holes = (_ref3 = opts.holes) != null ? _ref3 : 4;
    this.state = Game.states.initial;
    this.randomizer = (_ref4 = opts.randomizer) != null ? _ref4 : randomizers.mathRandom;
    this.evaluator = (_ref5 = opts.evaluator) != null ? _ref5 : evaluators.original;
  }

  Game.prototype.makeCode = function() {
    var hole;
    if (this.state !== Game.states.initial) {
      throw 'makeCode must be called in "initial" state';
    }
    this.code = (function() {
      var _ref, _results;
      _results = [];
      for (hole = 0, _ref = this.holes; 0 <= _ref ? hole < _ref : hole > _ref; 0 <= _ref ? hole++ : hole--) {
        _results.push(this.randomizer(this.colors));
      }
      return _results;
    }).call(this);
    this.guesses = 0;
    return this.state = Game.states.playing;
  };

  Game.prototype.guess = function(guess) {
    var result;
    if (this.state !== Game.states.playing) {
      throw 'The game is over, you can\'t make any more guesses.';
    }
    if (guess.length !== this.holes) {
      throw 'All holes must be filled in the guess.';
    }
    result = this.evaluator(this.code.slice(0, this.code.length), guess.slice(0, guess.length));
    this.guesses += 1;
    if (result.solved) {
      this.state = Game.states.won;
    } else if (this.guesses === this.rows) {
      this.state = Game.states.lost;
    }
    return result;
  };

  return Game;

})();
