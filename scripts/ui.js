var colors, hole, key, notify, peg, pegs, value, _len;

colors = ['red', 'blue', 'green', 'purple', 'white', 'yellow', 'black', 'cyan', 'pink', 'gray'];

pegs = {};

for (value = 0, _len = colors.length; value < _len; value++) {
  key = colors[value];
  pegs[key] = value;
}

notify = alert;

hole = function(row, column, type) {
  var $td;
  $td = $("<td class=\"" + type + "\" data-row=\"" + row + "\" data-column=\"" + column + "\">");
  if (type === 'code') {
    $td.attr({
      colspan: 2,
      rowspan: 2
    });
  }
  return $td;
};

peg = function(color, type) {
  return "<i class=\"" + type + "\" data-color=\"" + color + "\" style=\"background-color:" + colors[color] + "\">";
};

$(function() {
  var selectedColor;
  selectedColor = null;
  return $('form').submit(function(event) {
    var $board, $tbody, $tfoot, $thead, $tr, color, column, game, row, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
    event.preventDefault();
    game = new Game({
      rows: parseInt($('input[name=rows]').val()),
      holes: parseInt($('input[name=holes]').val()),
      colors: parseInt($('input[name=colors]').val())
    });
    game.makeCode();
    $board = $('<table><thead/><tbody/><tfoot/>');
    $tbody = $board.find('tbody');
    row = game.rows;
    while (--row >= 0) {
      $tr = $('<tr class="board">').attr('data-row', row);
      for (column = 0, _ref = game.holes; 0 <= _ref ? column < _ref : column > _ref; 0 <= _ref ? column++ : column--) {
        $tr.append(hole(row, column, 'code'));
      }
      for (column = 0, _ref2 = Math.ceil(game.holes / 2); 0 <= _ref2 ? column < _ref2 : column > _ref2; 0 <= _ref2 ? column++ : column--) {
        $tr.append(hole(row, column, 'key'));
      }
      $board.append($tr);
      $tr = $('<tr>');
      for (column = _ref3 = Math.ceil(game.holes / 2), _ref4 = game.holes; _ref3 <= _ref4 ? column < _ref4 : column > _ref4; _ref3 <= _ref4 ? column++ : column--) {
        $tr.append((hole(row, column, 'key')).addClass('sep'));
      }
      $tbody.append($tr);
    }
    $($tbody.find('tr[data-row=0]')).addClass('current');
    $tfoot = $board.find('tfoot');
    $tfoot.append('<tr class="vertical-spacer"><td>');
    $tr = $('<tr class="actions">');
    for (color = 0, _ref5 = game.colors; 0 <= _ref5 ? color < _ref5 : color > _ref5; 0 <= _ref5 ? color++ : color--) {
      $tr.append(hole(-1, color, 'code').append(peg(color, 'code')));
    }
    $tfoot.append($tr);
    $tfoot.append('<tr class="vertical-spacer"/><tr><td colspan="' + Math.max(game.colors, game.holes) + '"><input type="button" value="Guess" class="btn guess"></td></tr>');
    $thead = $board.find('thead');
    $tr = $('<tr class="shield">');
    for (column = 0, _ref6 = game.holes; 0 <= _ref6 ? column < _ref6 : column > _ref6; 0 <= _ref6 ? column++ : column--) {
      $tr.append(hole(-1, column, 'code').append(peg(game.code[column], 'code')));
    }
    $thead.append($tr);
    $board.find('tr.actions i').click(function() {
      $board.find('tr.actions td i.selected').removeClass('selected');
      return selectedColor = $(this).addClass('selected').attr('data-color');
    });
    $board.find('tr.board td.code').click(function() {
      if (selectedColor === null) {
        notify('Please select a color at the bottom of the board before placing any pegs.');
        return;
      }
      if (parseInt($(this).attr('data-row')) === game.guesses) {
        return $(this).html(peg(selectedColor, 'code'));
      }
    });
    $board.find('.guess').click(function() {
      var guess, i, p, put, result, _ref7, _ref8;
      guess = (function() {
        var _i, _len2, _ref7, _results;
        _ref7 = $board.find('td[data-row=' + game.guesses + '] i.code');
        _results = [];
        for (_i = 0, _len2 = _ref7.length; _i < _len2; _i++) {
          p = _ref7[_i];
          _results.push(parseInt($(p).attr('data-color')));
        }
        return _results;
      })();
      try {
        result = game.guess(guess);
        put = 0;
        for (i = 0, _ref7 = result.black; 0 <= _ref7 ? i < _ref7 : i > _ref7; 0 <= _ref7 ? i++ : i--) {
          $board.find("td.key[data-row=" + (game.guesses - 1) + "][data-column=" + (put++) + "]").html(peg(pegs.black, 'key'));
        }
        for (i = 0, _ref8 = result.white; 0 <= _ref8 ? i < _ref8 : i > _ref8; 0 <= _ref8 ? i++ : i--) {
          $board.find("td.key[data-row=" + (game.guesses - 1) + "][data-column=" + (put++) + "]").html(peg(pegs.white, 'key'));
        }
        $board.find('tr.current').removeClass('current');
        $board.find("tr[data-row=" + game.guesses + "]").addClass('current');
        if (game.state !== Game.states.playing) {
          if (game.state === Game.states.won) {
            notify('Correct!');
          } else if (game.state === Game.states.lost) {
            notify('I\'m sure you almost had it.');
          }
          return $board.find('tr.shield').removeClass('shield');
        }
      } catch (e) {
        return notify(e);
      }
    });
    return $('#game').html($board);
  });
});
