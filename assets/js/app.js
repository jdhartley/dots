var DOTS = (function()
{
	'use strict';

	var colors = ['g','p','r','b','y'],
		flag = false,
		color,
		dots = [],
		count = 0,
		currentNoteIndex = 0,

		_init = function()
		{
			$(window).resize(function()
			{
				$('html, body').css('font-size', Math.min( $('html').width(), $('html').height() ) / 30);
			}).trigger('resize')[0].scrollTo(0,0);

			// Make a 6x6 grid of dots!
			for ( var u = 0; u < 6; u++ )
			{
				$('body').append(
					$('<ul/>')
						.each(function()
						{
							for ( var d = 0; d < 6; d++ )
								$(this).append( newDot() );
						})
				);
			}

			$('html, body').on('touchstart touchmove', function(e) { e.preventDefault() });

			$('body')
				.on('dblclick', 'li', function(e)
				{
					$(this).trigger('dotRemove');
				})
				.on('mousedown touchstart', 'li', function(e)
				{
					if ( flag === true ) // prevent multitap
						return;

					e.preventDefault();
					e = _fixTouchEvent(e);
					var that = document.elementFromPoint(e.pageX, e.pageY);
					flag = true;
					color = $(that).addClass('active').attr('class').replace('active', '').trim();
					dots.push( that );
					currentNoteIndex++;
					_playcurrentNoteIndex();
				})
				.on('mousemove touchmove', 'li', function(e)
				{
					e = _fixTouchEvent(e);
					var that = document.elementFromPoint(e.pageX, e.pageY);

					// Are we even touching?
					if ( ! flag )
						return;

					// Is this dot the right color?
					if ( color !== $(that).attr('class').replace('active', '').trim() )
						return;

					var $lis = $('li'),
						index = $lis.index( $(that) ),
						$last = false,
						lastIndex = -1;

					if ( dots.length > 0 )
					{
						$last = $( dots[ dots.length - 1 ] );
						lastIndex = $lis.index( $last );

						// Test if this is an adjacent dot
						if ( ! (
							index === lastIndex // same dot
								||
							index + 6 === lastIndex // dot is to the right
								||
							index - 6 === lastIndex // dot is to the left
								||
							index + 1 === lastIndex // dot is above  TODO: check if same column too
								||
							index - 1 === lastIndex // dot is below  TODO: check if same column too
						) )
						{
							return;
						}

						// Are we going backwards?
						if ( index === $lis.index( $(dots[dots.length - 2]) ) )
						{
							$last.removeClass('active');
							dots.pop();

							currentNoteIndex--;
							_playcurrentNoteIndex();

							if ( $('body').hasClass('inSquare') && ! _activeDotsInSquare() )
							{
								$('body').removeClass();
							}
							return;
						}
					}

					if ( ! $(that).hasClass('active') || index !== lastIndex )
					{
						// This dot is awesome! Let's make it active
						$(that).addClass('active');
						dots.push( that );
						currentNoteIndex++;

						if ( _activeDotsInSquare() )
						{
							$('body').addClass('inSquare ' + color);
							_playcurrentNoteIndex(true);
						}
						else
						{
							_playcurrentNoteIndex();
						}
					}
				})
				.on('mouseup touchend', function()
				{
					flag = false;
					if ( dots.length > 1 )
					{
						$( _activeDotsInSquare() ? $('.' + color) : dots).trigger('dotRemove');
					}
					dots = [];
					$('li.active').removeClass('active');
					$('body').removeClass('inSquare');
					currentNoteIndex = 0;
				})
				.on('dotRemove', 'li', function()
				{
					var $this = $(this);
					$(this).parent().append( newDot() );
					setTimeout(function() { $this.remove(); }, 0);
				})

		},
		newDot = function()
		{
			return $('<li/>').addClass( colors[ Math.floor(Math.random() * 5) ] ).attr('id', 'd' + ++count);
		},
		_fixTouchEvent = function(e)
		{
			if ( ! e.originalEvent )
			{
				return e;
			}
			if ( e.originalEvent.touches && e.originalEvent.touches.length )
			{
				return e.originalEvent.touches[0];
			}
			if ( e.originalEvent.changedTouches && e.originalEvent.changedTouches.length )
			{
				return e.originalEvent.changedTouches[0];
			}
			return e;
		},
		_activeDotsInSquare = function()
		{
			var ids = $(dots).map(function() { return this.id }),
				itemsChecked = {};

			for ( var i = 0; i < ids.length; i++ )
			{
				if ( Object.prototype.hasOwnProperty.call(itemsChecked, ids[i]) )
				{
					return true;
				}
				itemsChecked[ ids[i] ] = true;
			}
			return false;
		},
		_playcurrentNoteIndex = function(inSquare)
		{
			var s = new Synthesizer(),
				getNoteForIndex = function(n)
				{
					// loop through steps and add to base note
					for ( var note = 56, n = n - 1; n > 0; n-- )
						note += ([3,2,2,3,2][ n % 5 ]);
					return note;
				},
				thisNote = getNoteForIndex(currentNoteIndex);

			s.on( thisNote );
			setTimeout(function() { s.off(thisNote); }, 500);
		};


	return {
		init: _init
	};
})();

$(DOTS.init);