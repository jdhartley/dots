var DOTS = (function()
{
	var colors = ['g','p','r','b','y'],
		flag = false,
		color,
		dots = [],
		count = 0,

		_init = function()
		{
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
				.on('mousedown touchstart', 'li', function()
				{
					flag = true;
					color = $(this).addClass('active').attr('class').replace('active', '').trim();
					dots.push( this );
				})
				.on('mousemove touchmove', 'li', function(e)
				{
					if ( e.originalEvent.touches && e.originalEvent.touches.length )
					{
						e = e.originalEvent.touches[0];
					}
					else if ( e.originalEvent.changedTouches && e.originalEvent.changedTouches.length )
					{
						e = e.originalEvent.changedTouches[0];
					}
					var that = document.elementFromPoint(e.pageX, e.pageY);

					// Are we even touching?
					if ( ! flag )
						return;

					// Is this dot the right color?
					if ( color !== $(that).attr('class').replace('active', '').trim() )
						return;

					var $lis = $('li'),
						index = $lis.index( $(that) );

					if ( dots.length > 1 )
					{
						var $last = $( dots[ dots.length - 1 ] ),
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
							return;
						}
					}

					// This dot is awesome! Let's make it active
					if ( ! $(that).hasClass('active') )
					{
						$(that).addClass('active');
						dots.push( that );
					}
				})
				.on('mouseup touchend', function()
				{
					flag = false;
					if ( dots.length > 1 )
					{
						$(dots).trigger('dotRemove');
					}
					dots = [];
					$('li.active').removeClass('active');
				})
				.on('dotRemove', 'li', function()
				{
					var $this = $(this);
					$(this).parent().append( newDot() );
					setTimeout(function() { $this.remove(); }, 600);
				})

		}
		newDot = function()
		{
			return $('<li/>').addClass( colors[ Math.floor(Math.random() * 5) ] ).attr('id', 'd' + ++count);
		};


	return {
		init: _init
	};
})();

$(DOTS.init);