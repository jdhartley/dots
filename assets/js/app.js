var DOTS = (function()
{
	var colors = ['g','p','r','b','y'],
		flag = false,
		color,

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
				})
				.on('mousemove', 'li', function()
				{
					if ( flag && color === $(this).attr('class').replace('active', '').trim() )
						$(this).addClass('active');
				})
				.on('mouseup', function()
				{
					flag = false;
					$('li.active').trigger('remove');
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