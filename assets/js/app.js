var DOTS = (function()
{
	var colors = ['g','p','r','b','y'],
		flag = false,
		color,
		dots = [],

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

			$('body')
				.on('mousedown', 'li', function()
				{
					flag = true;
					color = $(this).attr('class').replace('active', '').trim();
					dots.push( this );
				})
				.on('mousemove', 'li', function()
				{
					// Are we touching?
					if ( ! flag )
						return;

					// Is this dot the right color?
					if ( color !== $(this).attr('class').replace('active', '').trim() )
						return;

					// Test if this is an adjacent dot
					var isAdjacent = true,
						index = $('li').index( $(this) );

					// if ( index )

					// This dot is awesome! Let's make it active
					$(this).addClass('active');
					dots.push( this );
				})
				.on('mouseup', function()
				{
					flag = false;
					if ( dots.length > 1 )
					{
						$(dots).trigger('remove');
					}
					dots = [];
				})
				.on('remove', 'li', function()
				{
					$(this).parent().append( newDot() );
					$(this).remove();
				})

		}
		newDot = function()
		{
			return $('<li/>').addClass( colors[ Math.floor(Math.random() * 5) ] );
		};


	return {
		init: _init
	};
})();

$(DOTS.init);