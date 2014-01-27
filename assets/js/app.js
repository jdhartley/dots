var DOTS = (function() {
	'use strict';

	var colors = ['g','p','r','b','y'],
		flag = false,
		color,
		dots = [],
		count = 0,
		currentNoteIndex = 0,

		$board,
		$gameKeeper,
		$score,
		$menu,
		$game,

		gameMode = 'infinite', // infinite, moves, timed
		timeLeft,
		timedLoop,

		_init = function() {
			$game = $('#game');

			$menu = $('#menu')
				.on('click.dots', 'button', function() {
					$(this).addClass('active').siblings('.active').removeClass('active');
					$('#mode-title').html( $(this).attr('data-title') );
					$('#mode-description').html( $(this).attr('data-description') );
				})
				.on('click.dots', '#start', function() {
					gameMode = $('#menu nav .active').attr('data-mode');
					_gameStart();
				});
		},
		_gameStart = function() {
			$menu.hide();
			$game.show();
			$board = $('#board').empty();

			$gameKeeper = $('#gameKeeper')
				.html(function() {
					if ( 'infinite' === gameMode ) {
						return 'Moves';
					} else if ( 'moves' === gameMode ) {
						return 'Moves Left';
					} else if ( 'timed' === gameMode ) {
						return 'Time';
					}
				})
				.attr('data-value', function() {
					if ( 'infinite' === gameMode ) {
						return '0';
					} else if ( 'moves' === gameMode ) {
						return '30';
					} else if ( 'timed' === gameMode ) {
						return '60';
					}
				});

			$score = $('#score').attr('data-value', 0);

			$(window).off('resize.dots').on('resize.dots', function() {
				$board.css(
					'font-size',
					Math.min(
						$('html').width(),
						$('html').height() - $('header').outerHeight() - $('footer').outerHeight()
					) / 30
				);
			}).trigger('resize')[0].scrollTo(0,0);

			// Make a 6x6 grid of dots!
			var fillRow = function() {
				for ( var d = 0; d < 6; d++ ) {
					$(this).append( _newDot() );
				}
			};
			for ( var u = 0; u < 6; u++ ) {
				$board.append($('<ul/>').each(fillRow));
			}

			$board
				.off('.dots')
				.on('touchstart.dots touchmove.dots', function(e) { e.preventDefault(); })
				.on('dblclick.dots', 'li', function() {
					$(this).trigger('dotRemove');
				})
				.on('mousedown.dots touchstart.dots', 'li', function(e) {
					if ( flag ) { // prevent multitap
						return;
					}

					e.preventDefault();
					e = _fixTouchEvent(e);
					var that = document.elementFromPoint(e.pageX, e.pageY);
					flag = true;
					color = $(that).addClass('active').attr('class').replace('active', '').trim();
					dots.push( that );
					currentNoteIndex++;
					_playCurrentNoteIndex();
				})
				.on('mousemove.dots touchmove.dots', 'li', function(e) {
					e = _fixTouchEvent(e);
					var that = document.elementFromPoint(e.pageX, e.pageY);

					// Are we even touching?
					if ( ! flag ) {
						return;
					}

					// Is this dot the right color?
					if ( color !== $(that).attr('class').replace('active', '').trim() ) {
						return;
					}

					var $lis = $('li', $board),
						index = $lis.index( $(that) ),
						$last = false,
						lastIndex = -1;

					if ( dots.length > 0 ) {
						$last = $( dots[ dots.length - 1 ] );
						lastIndex = $lis.index( $last );

						// Test if this is an adjacent dot
						if ( ! (
							index === lastIndex || // same dot
							index + 6 === lastIndex || // dot is to the right
							index - 6 === lastIndex || // dot is to the left
							index + 1 === lastIndex || // dot is above  TODO: check if same column too
							index - 1 === lastIndex // dot is below  TODO: check if same column too
						) ) {
							return;
						}

						// Are we going backwards?
						if ( index === $lis.index( $(dots[dots.length - 2]) ) ) {
							$last.removeClass('active');
							dots.pop();

							currentNoteIndex--;
							_playCurrentNoteIndex();

							if ( $board.hasClass('inSquare') && ! _activeDotsInSquare() ) {
								$board.removeClass();
							}
							return;
						}
					}

					if ( ! $(that).hasClass('active') || index !== lastIndex ) {
						// This dot is awesome! Let's make it active
						$(that).addClass('active');
						dots.push( that );
						currentNoteIndex++;

						if ( _activeDotsInSquare() ) {
							$board.addClass('inSquare ' + color);
							_playCurrentNoteIndex(true);
						} else {
							_playCurrentNoteIndex();
						}
					}
				})
				.on('mouseup.dots touchend.dots', function() {
					flag = false;
					if ( dots.length > 1 ) {
						$( _activeDotsInSquare() ? $('.' + color) : dots).trigger('dotRemove');
						_updateGameKeeper();
					}
					dots = [];
					$('li.active', $board).removeClass('active');
					$board.removeClass('inSquare');
					currentNoteIndex = 0;
				})
				.on('dotRemove.dots', 'li', function() {
					var $this = $(this);
					$(this).parent().append( _newDot() );
					setTimeout(function() { $this.remove(); }, 0);
					_addPoint();
				});

			if ( 'timed' === gameMode ) {
				timeLeft = 60;
				timedLoop = setInterval(function() {
					if ( --timeLeft <= 0 ) {
						clearInterval(timedLoop);
						$board.off('.dots');
					}

					$gameKeeper.attr('data-value', timeLeft);
				}, 1000);
			}
		},
		_newDot = function() {
			return $('<li/>').addClass( colors[ Math.floor(Math.random() * 5) ] ).attr('id', 'd' + (++count));
		},
		_fixTouchEvent = function(e) {
			if ( ! e.originalEvent ) {
				return e;
			}
			if ( e.originalEvent.touches && e.originalEvent.touches.length ) {
				return e.originalEvent.touches[0];
			}
			if ( e.originalEvent.changedTouches && e.originalEvent.changedTouches.length ) {
				return e.originalEvent.changedTouches[0];
			}
			return e;
		},
		_activeDotsInSquare = function() {
			var ids = $(dots).map(function() { return this.id; }),
				itemsChecked = {};

			for ( var i = 0; i < ids.length; i++ ) {
				if ( Object.prototype.hasOwnProperty.call(itemsChecked, ids[i]) ) {
					return true;
				}
				itemsChecked[ ids[i] ] = true;
			}
			return false;
		},
		_playCurrentNoteIndex = function(inSquare) {
			// TO DO: sounds based on note
			return inSquare;
		},
		_addPoint = function() {
			$score.attr('data-value', function(index, value) { return parseInt(value) + 1; });
		},
		_updateGameKeeper = function() {
			if ( 'infinite' === gameMode ) {
				$gameKeeper.attr('data-value', function(index, value) { return parseInt(value) + 1; });
			} else if ( 'moves' === gameMode ) {
				$gameKeeper.attr('data-value', function(index, value) { return parseInt(value) - 1; });
			} else if ( 'timed' === gameMode ) {
				// handled in timedLoop
			}
		};

	return {
		init: _init
	};
})();

$(DOTS.init);
