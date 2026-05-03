/******************************************
    Version: 1.0
/****************************************** */

(function($) {
    "use strict";

	
	// Smooth scrolling using jQuery easing
	  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
		  var target = $(this.hash);
		  target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
		  if (target.length) {
			$('html, body').animate({
			  scrollTop: (target.offset().top - 54)
			}, 1000, "easeInOutExpo");
			return false;
		  }
		}
	  });
	
	// Prefill booking fields from selected CTAs.
	  $(document).on('click', 'a[data-training-format], a[data-preferred-date]', function() {
		var trainingFormat = $(this).data('training-format');
		var preferredDate = $(this).data('preferred-date');
		var $bookingFormat = $('#booking-format');
		var $bookingDate = $('#booking-date');
		if (trainingFormat && $bookingFormat.length) {
		  $bookingFormat.val(trainingFormat).trigger('change');
		}
		if (preferredDate && $bookingDate.length) {
		  $bookingDate.val(preferredDate).trigger('change');
		}
	  });
	
	function initScheduleCalendar() {
		var calendarGrid = document.getElementById('schedule-calendar-grid');
		var monthLabel = document.getElementById('schedule-month-label');
		var eventsList = document.getElementById('schedule-events-list');
		var prevButton = document.getElementById('schedule-prev-month');
		var nextButton = document.getElementById('schedule-next-month');
		var todayButton = document.getElementById('schedule-today-button');

		if (!calendarGrid || !monthLabel || !eventsList || !prevButton || !nextButton || !todayButton) {
			return;
		}

		var today = new Date();
		var currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		var selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		var monthFormatter = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' });
		var selectedDateFormatter = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' });

		var byRequestItem = {
			title: 'Individual Training',
			dateLabel: 'By request',
			time: 'Flexible',
			age: 'U7-U20',
			location: 'Salmisaari Arena',
			status: 'Ask availability',
			statusClass: 'is-available'
		};

		var monthlyItems = [
			{
				title: 'Summer Goalie Camp',
				month: 5,
				year: 2026,
				dateLabel: 'June 2026',
				time: 'To be announced',
				age: 'U9-U14',
				location: 'Helsinki',
				status: 'Coming soon'
			},
			{
				title: 'Preseason Goalie Intensive',
				month: 7,
				year: 2026,
				dateLabel: 'August 2026',
				time: 'To be announced',
				age: 'U15-U20',
				location: 'To be confirmed',
				status: 'Coming soon'
			}
		];

		var exactDateItems = [];

		function getDaysInMonth(year, month) {
			return new Date(year, month + 1, 0).getDate();
		}

		function formatDateKey(date) {
			var year = date.getFullYear();
			var month = String(date.getMonth() + 1).padStart(2, '0');
			var day = String(date.getDate()).padStart(2, '0');
			return year + '-' + month + '-' + day;
		}

		function isToday(year, month, day) {
			return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
		}

		function isSelectedDate(year, month, day) {
			return selectedDate &&
				year === selectedDate.getFullYear() &&
				month === selectedDate.getMonth() &&
				day === selectedDate.getDate();
		}

		function createDetail(iconClass, text) {
			var detail = document.createElement('li');
			var icon = document.createElement('i');
			var label = document.createElement('span');

			icon.className = iconClass;
			label.textContent = text;
			detail.appendChild(icon);
			detail.appendChild(label);

			return detail;
		}

		function createEventItem(item) {
			var eventItem = document.createElement('div');
			var heading = document.createElement('div');
			var headingText = document.createElement('div');
			var date = document.createElement('span');
			var title = document.createElement('h4');
			var status = document.createElement('span');
			var details = document.createElement('ul');

			eventItem.className = 'schedule-event-item';
			heading.className = 'schedule-event-heading';
			date.className = 'schedule-event-date';
			status.className = 'schedule-status' + (item.statusClass ? ' ' + item.statusClass : '');
			details.className = 'schedule-event-details';

			date.textContent = item.dateLabel;
			title.textContent = item.title;
			status.textContent = item.status;

			headingText.appendChild(date);
			headingText.appendChild(title);
			heading.appendChild(headingText);
			heading.appendChild(status);

			if (item.time) {
				details.appendChild(createDetail('fa fa-clock-o', item.time));
			}
			if (item.location) {
				details.appendChild(createDetail('fa fa-map-marker', item.location));
			}
			if (item.age) {
				details.appendChild(createDetail('fa fa-users', item.age));
			}

			eventItem.appendChild(heading);
			eventItem.appendChild(details);

			return eventItem;
		}

		function createRequestOption(title, format, isSelected) {
			var option = document.createElement('button');
			option.type = 'button';
			option.className = 'schedule-request-option';
			option.setAttribute('data-format', format);
			option.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
			option.textContent = title;

			if (isSelected) {
				option.className += ' is-selected';
			}

			return option;
		}

		function renderDateFallback() {
			var fallbackFormats = [
				'Individual Training',
				'Mini-Groups',
				'Group Training',
				'Video Analysis'
			];
			var selectedFormat = fallbackFormats[0];
			var fallback = document.createElement('div');
			var title = document.createElement('h4');
			var text = document.createElement('p');
			var optionLabel = document.createElement('span');
			var options = document.createElement('div');
			var button = document.createElement('a');
			var buttonText = document.createElement('span');

			fallback.className = 'schedule-date-fallback';
			title.textContent = 'No fixed sessions listed for this date yet.';
			text.textContent = 'You can still request training availability for this day.';
			optionLabel.className = 'schedule-request-label';
			optionLabel.textContent = 'Choose training format';
			options.className = 'schedule-request-options';
			button.href = '#contacts';
			button.className = 'sim-btn hvr-bounce-to-top';
			button.setAttribute('data-training-format', selectedFormat);
			if (selectedDate) {
				button.setAttribute('data-preferred-date', formatDateKey(selectedDate));
			}
			buttonText.textContent = 'Request Availability';

			fallbackFormats.forEach(function(format) {
				var option = createRequestOption(format, format, format === selectedFormat);
				option.addEventListener('click', function() {
					var allOptions = options.querySelectorAll('.schedule-request-option');
					selectedFormat = format;

					allOptions.forEach(function(optionButton) {
						optionButton.classList.remove('is-selected');
						optionButton.setAttribute('aria-pressed', 'false');
					});

					option.classList.add('is-selected');
					option.setAttribute('aria-pressed', 'true');
					button.setAttribute('data-training-format', selectedFormat);
				});

				options.appendChild(option);
			});

			button.appendChild(buttonText);

			fallback.appendChild(title);
			fallback.appendChild(text);
			fallback.appendChild(optionLabel);
			fallback.appendChild(options);
			fallback.appendChild(button);

			return fallback;
		}

		function renderCalendar() {
			var year = currentMonth.getFullYear();
			var month = currentMonth.getMonth();
			var firstDay = new Date(year, month, 1).getDay();
			var daysInMonth = getDaysInMonth(year, month);
			var daysInPrevMonth = getDaysInMonth(year, month - 1);
			var totalCells = Math.max(35, Math.ceil((firstDay + daysInMonth) / 7) * 7);

			monthLabel.textContent = monthFormatter.format(currentMonth);
			calendarGrid.innerHTML = '';

			for (var cellIndex = 0; cellIndex < totalCells; cellIndex++) {
				var day = document.createElement('span');
				var dayNumber = cellIndex - firstDay + 1;
				var displayNumber = dayNumber;
				var cellYear = year;
				var cellMonth = month;
				var isMuted = false;

				if (dayNumber < 1) {
					displayNumber = daysInPrevMonth + dayNumber;
					cellMonth = month - 1;
					isMuted = true;
				} else if (dayNumber > daysInMonth) {
					displayNumber = dayNumber - daysInMonth;
					cellMonth = month + 1;
					isMuted = true;
				}

				if (cellMonth < 0) {
					cellMonth = 11;
					cellYear = year - 1;
				} else if (cellMonth > 11) {
					cellMonth = 0;
					cellYear = year + 1;
				}

				if (!isMuted) {
					day = document.createElement('button');
					day.type = 'button';
				}

				day.className = 'schedule-day' + (isMuted ? ' is-muted' : '');
				day.textContent = displayNumber;

				if (!isMuted && isToday(cellYear, cellMonth, displayNumber)) {
					day.className += ' is-today';
					day.setAttribute('aria-current', 'date');
				}

				if (!isMuted && isSelectedDate(cellYear, cellMonth, displayNumber)) {
					day.className += ' is-selected';
					day.setAttribute('aria-pressed', 'true');
				} else if (!isMuted) {
					day.setAttribute('aria-pressed', 'false');
				}

				if (!isMuted) {
					day.setAttribute('aria-label', 'Select ' + selectedDateFormatter.format(new Date(cellYear, cellMonth, displayNumber)));
					day.addEventListener('click', function(date) {
						return function() {
							selectedDate = date;
							currentMonth = new Date(date.getFullYear(), date.getMonth(), 1);
							renderSchedule();
						};
					}(new Date(cellYear, cellMonth, displayNumber)));
				}

				calendarGrid.appendChild(day);
			}
		}

		function renderEvents() {
			var year = currentMonth.getFullYear();
			var month = currentMonth.getMonth();
			var visibleMonthlyItems = monthlyItems.filter(function(item) {
				return item.year === year && item.month === month;
			});
			var visibleExactItems = selectedDate ? exactDateItems.filter(function(item) {
				return item.date === formatDateKey(selectedDate);
			}) : [];

			eventsList.innerHTML = '';

			if (selectedDate) {
				var selectedLabel = document.createElement('p');
				selectedLabel.className = 'schedule-selected-date';
				selectedLabel.textContent = selectedDateFormatter.format(selectedDate);
				eventsList.appendChild(selectedLabel);

				if (visibleExactItems.length) {
					visibleExactItems.forEach(function(item) {
						eventsList.appendChild(createEventItem(item));
					});
				} else {
					eventsList.appendChild(renderDateFallback());
				}

				return;
			}

			eventsList.appendChild(createEventItem(byRequestItem));

			if (visibleMonthlyItems.length) {
				visibleMonthlyItems.forEach(function(item) {
					eventsList.appendChild(createEventItem(item));
				});
			} else {
				var emptyNote = document.createElement('p');
				emptyNote.className = 'schedule-empty-note';
				emptyNote.textContent = 'No fixed sessions listed for this month yet.';
				eventsList.appendChild(emptyNote);
			}
		}

		function renderSchedule() {
			renderCalendar();
			renderEvents();
		}

		function updateSelectionForDisplayedMonth() {
			if (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()) {
				selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			} else {
				selectedDate = null;
			}
		}

		prevButton.addEventListener('click', function() {
			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
			updateSelectionForDisplayedMonth();
			renderSchedule();
		});

		nextButton.addEventListener('click', function() {
			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
			updateSelectionForDisplayedMonth();
			renderSchedule();
		});

		todayButton.addEventListener('click', function() {
			currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
			selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			renderSchedule();
		});

		renderSchedule();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initScheduleCalendar);
	} else {
		initScheduleCalendar();
	}

    // Closes responsive menu when a scroll trigger link is clicked
	  $('.js-scroll-trigger').click(function() {
		$('.navbar-collapse').collapse('hide');
	  });

	// Activate scrollspy to add active class to navbar items on scroll
	  $('body').scrollspy({
		target: '#mainNav',
		offset: 56
	  });

	// Collapse Navbar
	  var navbarCollapse = function() {
		if ($("#mainNav").offset().top > 100) {
		  $("#mainNav").addClass("navbar-shrink");
		} else {
		  $("#mainNav").removeClass("navbar-shrink");
		}
	  };
	// Collapse now if page is not at top
	  navbarCollapse();
	  // Collapse the navbar when page is scrolled
	  $(window).scroll(navbarCollapse);

	// Hide navbar when modals trigger
	  $('.portfolio-modal').on('show.bs.modal', function(e) {
		$(".navbar").addClass("d-none");
	  })
	  $('.portfolio-modal').on('hidden.bs.modal', function(e) {
		$(".navbar").removeClass("d-none");
	  })

    // Scroll to top  		
	if ($('#scroll-to-top').length) {
		var scrollTrigger = 100, // px
			backToTop = function () {
				var scrollTop = $(window).scrollTop();
				if (scrollTop > scrollTrigger) {
					$('#scroll-to-top').addClass('show');
				} else {
					$('#scroll-to-top').removeClass('show');
				}
			};
		backToTop();
		$(window).on('scroll', function () {
			backToTop();
		});
		$('#scroll-to-top').on('click', function (e) {
			e.preventDefault();
			$('html,body').animate({
				scrollTop: 0
			}, 700);
		});
	}
	
	// Banner 
	
    $('.heading').height( $(window).height() );
	$('.parallaxie').parallaxie();
	
    // LOADER
    $(window).load(function() {
        $("#preloader").on(500).fadeOut();
        $(".preloader").on(600).fadeOut("slow");
    });

	// Gallery Filter
        var Container = $('.container');
        Container.imagesLoaded(function () {
            var portfolio = $('.gallery-menu');
            portfolio.on('click', 'button', function () {
                $(this).addClass('active').siblings().removeClass('active');
                var filterValue = $(this).attr('data-filter');
                $grid.isotope({
                    filter: filterValue
                });
            });
            var $grid = $('.gallery-list').isotope({
                itemSelector: '.gallery-grid'
            });

        });
	
    // FUN FACTS   

    function count($this) {
        var current = parseInt($this.html(), 10);
        current = current + 50; /* Where 50 is increment */
        $this.html(++current);
        if (current > $this.data('count')) {
            $this.html($this.data('count'));
        } else {
            setTimeout(function() {
                count($this)
            }, 30);
        }
    }
    $(".stat_count, .stat_count_download").each(function() {
        $(this).data('count', parseInt($(this).html(), 10));
        $(this).html('0');
        count($(this));
    });

    // CONTACT
    jQuery(document).ready(function() {
        $('#contactform').submit(function() {
            var action = $(this).attr('action');
            $("#message").slideUp(750, function() {
                $('#message').hide();
                $('#submit')
                    .after('<img src="images/ajax-loader.gif" class="loader" />')
                    .attr('disabled', 'disabled');
                $.post(action, {
                        first_name: $('#first_name').val(),
                        last_name: $('#last_name').val(),
                        email: $('#email').val(),
                        phone: $('#phone').val(),
                        select_service: $('#select_service').val(),
                        select_price: $('#select_price').val(),
                        comments: $('#comments').val(),
                        verify: $('#verify').val()
                    },
                    function(data) {
                        document.getElementById('message').innerHTML = data;
                        $('#message').slideDown('slow');
                        $('#contactform img.loader').fadeOut('slow', function() {
                            $(this).remove()
                        });
                        $('#submit').removeAttr('disabled');
                        if (data.match('success') != null) $('#contactform').slideUp('slow');
                    }
                );
            });
            return false;
        });
    });

})(jQuery);
