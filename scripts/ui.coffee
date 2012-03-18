colors = ['red', 'blue', 'green', 'purple', 'white', 'yellow', 'black', 'cyan', 'pink', 'gray']
pegs = {}
pegs[key] = value for key, value in colors

notify = alert

hole = (row, column, type) -> 
  $td = $ "<td class=\"#{type}\" data-row=\"#{row}\" data-column=\"#{column}\">"
  if type == 'code'
    $td.attr
      colspan: 2
      rowspan: 2
  $td

peg = (color, type) -> "<i class=\"#{type}\" data-color=\"#{color}\" style=\"background-color:#{colors[color]}\">"

$ ->
  selectedColor = null

  $('form').submit (event) ->
    event.preventDefault()

    game = new Game
      rows: parseInt $('input[name=rows]').val()
      holes: parseInt $('input[name=holes]').val()
      colors: parseInt $('input[name=colors]').val()

    game.makeCode()

    $board = $('<table><thead/><tbody/><tfoot/>')

    # Playing field
    $tbody = $board.find 'tbody'
    row = game.rows
    while --row >= 0
      # Add a row
      $tr = $('<tr class="board">').attr 'data-row', row
      # With the code cells
      for column in [0...game.holes]
        $tr.append hole row, column, 'code'
      # And two key cells
      for column in [0...Math.ceil(game.holes/2)]
        $tr.append hole row, column, 'key'
      # And two more key cells on the next row
      $board.append $tr
      $tr = $('<tr>')
      for column in [Math.ceil(game.holes/2)...game.holes]
        $tr.append (hole row, column, 'key').addClass 'sep'
      $tbody.append $tr

    $($tbody.find('tr[data-row=0]')).addClass 'current'

    # Actions bar
    $tfoot = $board.find 'tfoot'
    $tfoot.append '<tr class="vertical-spacer"><td>'
    $tr = $('<tr class="actions">')
    for color in [0...game.colors]
      $tr.append hole(-1, color, 'code').append peg color, 'code'
    $tfoot.append $tr
    $tfoot.append '<tr class="vertical-spacer"/><tr><td colspan="'+Math.max(game.colors,game.holes)+'"><input type="button" value="Guess" class="btn guess"></td></tr>'

    # Shield
    $thead = $board.find 'thead'
    $tr = $('<tr class="shield">')
    for column in [0...game.holes]
      $tr.append hole(-1, column, 'code').append peg game.code[column], 'code'
    $thead.append $tr


    # Handle actions

    # Select a color
    $board.find('tr.actions i').click ->
      $board.find('tr.actions td i.selected').removeClass 'selected'
      selectedColor = $(this).addClass('selected').attr 'data-color'

    # Put down a peg
    $board.find('tr.board td.code').click ->
      if selectedColor is null 
        notify 'Please select a color at the bottom of the board before placing any pegs.'
        return

      if parseInt($(this).attr('data-row')) == game.guesses
        $(this).html peg selectedColor, 'code'

    # Guess
    $board.find('.guess').click ->
      guess = (parseInt $(p).attr 'data-color' for p in $board.find('td[data-row=' + game.guesses + '] i.code'))
      try
        result = game.guess guess
        put = 0
        for i in [0...result.black]
          $board.find("td.key[data-row=#{game.guesses-1}][data-column=#{put++}]").html peg pegs.black, 'key'
        for i in [0...result.white]
          $board.find("td.key[data-row=#{game.guesses-1}][data-column=#{put++}]").html peg pegs.white, 'key'

        $board.find('tr.current').removeClass 'current'
        $board.find("tr[data-row=#{game.guesses}]").addClass 'current'

        if game.state != Game.states.playing
          if game.state == Game.states.won
            notify 'Correct!'
          else if game.state == Game.states.lost
            notify 'I\'m sure you almost had it.'
          $board.find('tr.shield').removeClass 'shield'
      catch e
        notify e

    $('#game').html $board
