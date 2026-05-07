/******************************************
    Version: 1.0
/****************************************** */

(function($) {
    "use strict";

	var bookingRequestsEndpoint = 'https://script.google.com/macros/s/AKfycbwr1xJUyKm85kbUD4YSxKR7pRb-jP0kfzRQmhSOEdMG4MGD9XcU6gjjOvvKMTpq_RxEnQ/exec';
	var scheduleEndpoint = 'https://script.google.com/macros/s/AKfycbwr1xJUyKm85kbUD4YSxKR7pRb-jP0kfzRQmhSOEdMG4MGD9XcU6gjjOvvKMTpq_RxEnQ/exec?action=schedule';
	var programsEndpoint = 'https://script.google.com/macros/s/AKfycbwr1xJUyKm85kbUD4YSxKR7pRb-jP0kfzRQmhSOEdMG4MGD9XcU6gjjOvvKMTpq_RxEnQ/exec?action=programs';

	
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
	
	var bookingTimeHours = ['07','08','09','10','11','12','13','14','15','16','17','18','19','20','21'];
	var bookingTimeMinutes = ['00','15','30','45'];

	function getClosestBookingMinute(minute) {
		return bookingTimeMinutes.reduce(function(closestMinute, allowedMinute) {
			var closestDistance = Math.abs(parseInt(closestMinute, 10) - minute);
			var allowedDistance = Math.abs(parseInt(allowedMinute, 10) - minute);
			return allowedDistance < closestDistance ? allowedMinute : closestMinute;
		}, bookingTimeMinutes[0]);
	}

	function parseBookingTimeParts(value) {
		var time = value.trim();
		var match;
		var hour;
		var minute;
		var normalizedHour = '';
		var normalizedMinute = '';

		if (!time) {
			return '';
		}

		time = time.toLowerCase();

		if (/^(m|min)\s*\d{1,2}$/.test(time)) {
			match = time.match(/^(?:m|min)\s*(\d{1,2})$/);
			minute = parseInt(match[1], 10);

			if (minute > 59) {
				return null;
			}

			return {
				hour: '',
				minute: getClosestBookingMinute(minute),
				hasHour: false,
				hasMinute: true
			};
		}

		time = time.replace(/[.\s]+/, ':');

		if (/^:\d{1,2}$/.test(time)) {
			match = time.match(/^:(\d{1,2})$/);
			minute = parseInt(match[1], 10);

			if (minute > 59) {
				return null;
			}

			return {
				hour: '',
				minute: getClosestBookingMinute(minute),
				hasHour: false,
				hasMinute: true
			};
		}

		if (/^\d{1,2}$/.test(time)) {
			hour = parseInt(time, 10);
			normalizedHour = String(hour).padStart(2, '0');

			if (bookingTimeHours.indexOf(normalizedHour) === -1) {
				return null;
			}

			return {
				hour: normalizedHour,
				minute: '',
				hasHour: true,
				hasMinute: false
			};
		} else if (/^\d{3,4}$/.test(time)) {
			match = [time, time.slice(0, -2), time.slice(-2)];
		} else {
			match = time.match(/^(\d{1,2}):(\d{1,2})$/);
		}

		if (!match) {
			return null;
		}

		hour = parseInt(match[1], 10);
		minute = parseInt(match[2], 10);
		normalizedHour = String(hour).padStart(2, '0');
		normalizedMinute = getClosestBookingMinute(minute);

		if (hour > 23 || minute > 59) {
			return null;
		}

		if (bookingTimeHours.indexOf(normalizedHour) === -1) {
			return null;
		}

		return {
			hour: normalizedHour,
			minute: normalizedMinute,
			hasHour: true,
			hasMinute: true
		};
	}

	function normalizeBookingTimeValue(value) {
		var parsedTime = parseBookingTimeParts(value);

		if (parsedTime === '') {
			return '';
		}

		if (!parsedTime) {
			return null;
		}

		if (parsedTime.hasHour && parsedTime.hasMinute) {
			return parsedTime.hour + ':' + parsedTime.minute;
		}

		if (parsedTime.hasHour) {
			return parsedTime.hour + ':00';
		}

		return '';
	}

	function initBookingTimePicker() {
		var picker = document.querySelector('[data-time-picker]');
		var trigger = document.getElementById('booking-time-trigger');
		var popover = document.getElementById('booking-time-popover');
		var timeField = document.getElementById('booking-time-input');
		var hiddenField = document.getElementById('booking-time');
		var hoursWheel = picker ? picker.querySelector('[data-time-hours]') : null;
		var minutesWheel = picker ? picker.querySelector('[data-time-minutes]') : null;
		var doneButton = picker ? picker.querySelector('[data-time-done]') : null;
		var form = document.getElementById('bookingRequestForm');
		var selectedHour = '';
		var selectedMinute = '';

		if (!picker || !trigger || !popover || !timeField || !hiddenField || !hoursWheel || !minutesWheel) {
			return;
		}

		function createOption(value, type) {
			var option = document.createElement('button');
			option.className = 'booking-time-option';
			option.type = 'button';
			option.textContent = value;
			option.dataset.timeValue = value;
			option.dataset.timeType = type;
			option.setAttribute('role', 'option');
			option.setAttribute('aria-selected', 'false');
			return option;
		}

		function renderOptions() {
			bookingTimeHours.forEach(function(hour) {
				hoursWheel.appendChild(createOption(hour, 'hour'));
			});
			bookingTimeMinutes.forEach(function(minute) {
				minutesWheel.appendChild(createOption(minute, 'minute'));
			});
		}

		function syncSelectedOptions() {
			var options = picker.querySelectorAll('.booking-time-option');
			options.forEach(function(option) {
				var isSelected = (option.dataset.timeType === 'hour' && option.dataset.timeValue === selectedHour) ||
					(option.dataset.timeType === 'minute' && option.dataset.timeValue === selectedMinute);
				option.classList.toggle('is-selected', isSelected);
				option.setAttribute('aria-selected', isSelected ? 'true' : 'false');
			});
		}

		function syncTimeField() {
			var value = selectedHour && selectedMinute ? selectedHour + ':' + selectedMinute : '';
			timeField.value = value;
			hiddenField.value = value;
		}

		function centerSelectedOption(wheel, value, shouldAnimate) {
			var selected = wheel.querySelector('[data-time-value="' + value + '"]');
			var targetTop;

			if (selected) {
				targetTop = selected.offsetTop - ((wheel.clientHeight - selected.offsetHeight) / 2);
				if (typeof wheel.scrollTo === 'function') {
					wheel.scrollTo({
						top: targetTop,
						behavior: shouldAnimate ? 'smooth' : 'auto'
					});
				} else {
					wheel.scrollTop = targetTop;
				}
			}
		}

		function openPicker() {
			popover.hidden = false;
			trigger.setAttribute('aria-expanded', 'true');
			picker.classList.add('is-open');
			setTimeout(function() {
				if (selectedHour) {
					centerSelectedOption(hoursWheel, selectedHour, false);
				}
				if (selectedMinute) {
					centerSelectedOption(minutesWheel, selectedMinute, false);
				}
			}, 0);
		}

		function closePicker() {
			popover.hidden = true;
			trigger.setAttribute('aria-expanded', 'false');
			picker.classList.remove('is-open');
		}

		function togglePicker() {
			if (popover.hidden) {
				openPicker();
			} else {
				closePicker();
			}
		}

		function selectTimePart(type, value) {
			if (type === 'hour') {
				selectedHour = value;
				if (!selectedMinute) {
					selectedMinute = '00';
				}
			}
			if (type === 'minute') {
				selectedMinute = value;
			}
			syncSelectedOptions();
			syncTimeField();
		}

		function focusSiblingOption(wheel, direction) {
			var options = Array.prototype.slice.call(wheel.querySelectorAll('.booking-time-option'));
			var currentIndex = options.indexOf(document.activeElement);
			var nextIndex = currentIndex < 0 ? 0 : Math.max(0, Math.min(options.length - 1, currentIndex + direction));
			if (options[nextIndex]) {
				options[nextIndex].focus();
			}
		}

		function syncSelectionFromInput(shouldNormalizeInput) {
			var parsedTime = parseBookingTimeParts(timeField.value);

			if (parsedTime === '') {
				selectedHour = '';
				selectedMinute = '';
				hiddenField.value = '';
				syncSelectedOptions();
				return '';
			}

			if (!parsedTime) {
				selectedHour = '';
				selectedMinute = '';
				hiddenField.value = '';
				syncSelectedOptions();
				return null;
			}

			selectedHour = parsedTime.hasHour ? parsedTime.hour : '';
			selectedMinute = parsedTime.hasMinute ? parsedTime.minute : '';
			hiddenField.value = selectedHour && selectedMinute ? selectedHour + ':' + selectedMinute : '';
			syncSelectedOptions();
			if (!popover.hidden && selectedHour) {
				centerSelectedOption(hoursWheel, selectedHour, true);
			}
			if (!popover.hidden && selectedMinute) {
				centerSelectedOption(minutesWheel, selectedMinute, true);
			}
			if (shouldNormalizeInput && hiddenField.value) {
				timeField.value = hiddenField.value;
			}
			return hiddenField.value || (selectedHour ? selectedHour + ':00' : '');
		}

		renderOptions();
		syncSelectionFromInput();

		trigger.addEventListener('click', togglePicker);

		timeField.addEventListener('focus', openPicker);

		timeField.addEventListener('input', function() {
			if (!timeField.value.trim()) {
				selectedHour = '';
				selectedMinute = '';
				hiddenField.value = '';
				syncSelectedOptions();
				return;
			}
			syncSelectionFromInput();
		});

		timeField.addEventListener('change', function() {
			syncSelectionFromInput(false);
		});

		timeField.addEventListener('blur', function() {
			syncSelectionFromInput(true);
		});

		picker.addEventListener('click', function(event) {
			var option = event.target.closest('.booking-time-option');
			if (!option || !picker.contains(option)) {
				return;
			}
			selectTimePart(option.dataset.timeType, option.dataset.timeValue);
		});

		picker.addEventListener('keydown', function(event) {
			var option = event.target.closest('.booking-time-option');

			if (event.key === 'Escape') {
				closePicker();
				trigger.focus();
				return;
			}

			if (!option) {
				return;
			}

			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				selectTimePart(option.dataset.timeType, option.dataset.timeValue);
			}

			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				focusSiblingOption(option.parentElement, event.key === 'ArrowDown' ? 1 : -1);
			}
		});

		document.addEventListener('click', function(event) {
			if (!popover.hidden && !picker.contains(event.target)) {
				closePicker();
			}
		});

		if (doneButton) {
			doneButton.addEventListener('click', function() {
				syncSelectionFromInput(false);
				if (selectedHour && !selectedMinute) {
					selectedMinute = '00';
					syncSelectedOptions();
					syncTimeField();
					centerSelectedOption(minutesWheel, selectedMinute, true);
				} else if (selectedHour && selectedMinute) {
					syncTimeField();
				}
				closePicker();
				trigger.focus();
			});
		}

		if (form) {
			form.addEventListener('reset', function() {
				setTimeout(function() {
					selectedHour = '';
					selectedMinute = '';
					syncSelectedOptions();
					timeField.value = '';
					hiddenField.value = '';
					closePicker();
				}, 0);
			});
		}
	}

	function initBookingFormSubmission() {
		var form = document.getElementById('bookingRequestForm');
		var submitButton = document.getElementById('sendBookingButton');
		var status = document.getElementById('booking-form-status');

		if (!form || !submitButton || !status) {
			return;
		}

		function getFieldValue(id) {
			var field = document.getElementById(id);
			return field ? field.value.trim() : '';
		}

		function setStatus(message, type) {
			status.textContent = message;
			status.className = 'booking-form-status';
			if (type) {
				status.className += ' is-' + type;
			}
		}

		function setLoading(isLoading) {
			submitButton.disabled = isLoading;
			submitButton.textContent = isLoading ? 'Sending...' : 'Send Booking Request';
		}

		function buildPayload() {
			var preferredTimeInput = document.getElementById('booking-time-input');
			var preferredTime = normalizeBookingTimeValue(preferredTimeInput ? preferredTimeInput.value : getFieldValue('booking-time'));

			if (preferredTime !== null) {
				document.getElementById('booking-time').value = preferredTime;
				if (preferredTimeInput && preferredTime) {
					preferredTimeInput.value = preferredTime;
				}
			}

			return {
				name: getFieldValue('booking-name'),
				email: getFieldValue('booking-email'),
				phone: getFieldValue('booking-phone'),
				goalie_age: getFieldValue('booking-age-group'),
				preferred_date: getFieldValue('booking-date'),
				training_type: getFieldValue('booking-format'),
				preferred_time: preferredTime === null ? (preferredTimeInput ? preferredTimeInput.value.trim() : getFieldValue('booking-time')) : preferredTime,
				message: getFieldValue('booking-message'),
				source: 'website'
			};
		}

		function validatePayload(payload) {
			if (!payload.name) {
				return 'Please enter parent or player name.';
			}
			if (!payload.training_type) {
				return 'Please choose a training format.';
			}
			if (!payload.email && !payload.phone) {
				return 'Please enter an email or phone number.';
			}
			if (payload.preferred_time && !normalizeBookingTimeValue(payload.preferred_time)) {
				return 'Please enter preferred time between 07:00 and 21:45.';
			}
			return '';
		}

		function encodePayload(payload) {
			var body = new URLSearchParams();
			Object.keys(payload).forEach(function(key) {
				body.append(key, payload[key]);
			});
			return body;
		}

		function submitBookingRequest() {
			var payload = buildPayload();
			var validationError = validatePayload(payload);

			if (validationError) {
				setStatus(validationError, 'error');
				return;
			}

			setLoading(true);
			setStatus('', '');

			fetch(bookingRequestsEndpoint, {
				method: 'POST',
				body: encodePayload(payload)
			})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Booking request failed.');
				}
				return response.text();
			})
			.then(function() {
				setStatus('Thank you! Your booking request has been sent.', 'success');
				form.reset();
			})
			.catch(function() {
				setStatus('Sorry, something went wrong. Please try again or contact us directly.', 'error');
			})
			.finally(function() {
				setLoading(false);
			});
		}

		submitButton.addEventListener('click', submitBookingRequest);
		form.addEventListener('submit', function(event) {
			event.preventDefault();
			submitBookingRequest();
		});
	}

	function initPrograms() {
		var programsRow = document.querySelector('#programs .programs-row');

		if (!programsRow || typeof fetch !== 'function') {
			return;
		}

		function normalizeProgramText(value) {
			return String(value || '').trim();
		}

		function getSortedProgramItems(items) {
			return items.slice().sort(function(firstItem, secondItem) {
				var firstOrder = Number(firstItem.display_order);
				var secondOrder = Number(secondItem.display_order);
				firstOrder = isFinite(firstOrder) ? firstOrder : 999;
				secondOrder = isFinite(secondOrder) ? secondOrder : 999;

				return (firstOrder - secondOrder) ||
					normalizeProgramText(firstItem.title).localeCompare(normalizeProgramText(secondItem.title));
			});
		}

		function createProgramDetail(label, value) {
			var item = document.createElement('li');
			var strong = document.createElement('strong');

			strong.textContent = label + ':';
			item.appendChild(strong);
			item.appendChild(document.createTextNode(' ' + value));

			return item;
		}

		function createProgramCard(item) {
			var column = document.createElement('div');
			var card = document.createElement('div');
			var header = document.createElement('div');
			var label = document.createElement('span');
			var title = document.createElement('h2');
			var body = document.createElement('div');
			var description = document.createElement('p');
			var details = document.createElement('ul');
			var button = document.createElement('a');
			var buttonText = document.createElement('span');
			var trainingFormat = normalizeProgramText(item.training_format) || normalizeProgramText(item.title);

			column.className = 'col-md-6';
			card.className = 'program-card';
			header.className = 'program-card-header';
			label.className = 'program-card-label';
			body.className = 'program-card-body';
			details.className = 'program-card-details';
			button.className = 'sim-btn hvr-bounce-to-top';
			button.href = '#contacts';
			button.setAttribute('data-training-format', trainingFormat);

			label.textContent = normalizeProgramText(item.label);
			title.textContent = normalizeProgramText(item.title);
			description.textContent = normalizeProgramText(item.description);
			buttonText.textContent = normalizeProgramText(item.button_text) || 'Book Training';

			if (normalizeProgramText(item.age)) {
				details.appendChild(createProgramDetail('Age', normalizeProgramText(item.age)));
			}
			if (normalizeProgramText(item.duration)) {
				details.appendChild(createProgramDetail('Duration', normalizeProgramText(item.duration)));
			}
			if (normalizeProgramText(item.price)) {
				details.appendChild(createProgramDetail('Price', normalizeProgramText(item.price)));
			}
			if (normalizeProgramText(item.status)) {
				details.appendChild(createProgramDetail('Status', normalizeProgramText(item.status)));
			}

			header.appendChild(label);
			header.appendChild(title);
			button.appendChild(buttonText);
			body.appendChild(description);
			body.appendChild(details);
			body.appendChild(button);
			card.appendChild(header);
			card.appendChild(body);
			column.appendChild(card);

			return column;
		}

		function renderLivePrograms(items) {
			var fragment = document.createDocumentFragment();
			var validItems = getSortedProgramItems(items).filter(function(item) {
				return normalizeProgramText(item.title);
			});

			if (!validItems.length) {
				return;
			}

			validItems.forEach(function(item) {
				fragment.appendChild(createProgramCard(item));
			});

			programsRow.innerHTML = '';
			programsRow.appendChild(fragment);
		}

		fetch(programsEndpoint, {
			cache: 'no-store'
		})
		.then(function(response) {
			if (!response.ok) {
				throw new Error('Programs request failed.');
			}
			return response.json();
		})
		.then(function(data) {
			if (!data || data.ok !== true || !Array.isArray(data.items) || !data.items.length) {
				throw new Error('Programs response was not valid.');
			}
			renderLivePrograms(data.items);
		})
		.catch(function(error) {
			if (window.console && typeof window.console.warn === 'function') {
				window.console.warn('Live programs could not be loaded. Using fallback program cards.', error);
			}
		});
	}

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
		var isScheduleLoading = typeof fetch === 'function';

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
		var fallbackRequestFormats = [
			'Individual Training',
			'Mini-Groups',
			'Group Training',
			'Video Analysis'
		];
		var scheduleRequestFormats = fallbackRequestFormats.slice();

		function normalizeScheduleText(value) {
			return String(value || '').trim();
		}

		function getScheduleStatusClass(status) {
			var normalizedStatus = normalizeScheduleText(status).toLowerCase();
			if (normalizedStatus.indexOf('available') !== -1 || normalizedStatus.indexOf('ask') !== -1 || normalizedStatus.indexOf('open') !== -1) {
				return 'is-available';
			}
			return '';
		}

		function createScheduleItem(item) {
			var status = normalizeScheduleText(item.status);
			return {
				id: normalizeScheduleText(item.id),
				title: normalizeScheduleText(item.title),
				date: normalizeScheduleText(item.date),
				dateLabel: normalizeScheduleText(item.date_label) || normalizeScheduleText(item.date),
				time: normalizeScheduleText(item.time),
				type: normalizeScheduleText(item.type),
				age: normalizeScheduleText(item.age),
				location: normalizeScheduleText(item.location),
				status: status,
				statusClass: getScheduleStatusClass(status),
				trainingFormat: normalizeScheduleText(item.training_format),
				description: normalizeScheduleText(item.description)
			};
		}

		function addScheduleRequestFormat(format, formats) {
			var normalizedFormat = normalizeScheduleText(format);
			if (normalizedFormat && formats.indexOf(normalizedFormat) === -1) {
				formats.push(normalizedFormat);
			}
		}

		function getSortedScheduleItems(items) {
			return items.slice().sort(function(firstItem, secondItem) {
				var firstOrder = Number(firstItem.display_order);
				var secondOrder = Number(secondItem.display_order);
				firstOrder = isFinite(firstOrder) ? firstOrder : 999;
				secondOrder = isFinite(secondOrder) ? secondOrder : 999;

				return (firstOrder - secondOrder) ||
					normalizeScheduleText(firstItem.date).localeCompare(normalizeScheduleText(secondItem.date)) ||
					normalizeScheduleText(firstItem.title).localeCompare(normalizeScheduleText(secondItem.title));
			});
		}

		function applyLiveScheduleItems(items) {
			var nextByRequestItem = null;
			var nextMonthlyItems = [];
			var nextExactDateItems = [];
			var nextRequestFormats = [];

			getSortedScheduleItems(items).forEach(function(rawItem) {
				var item = createScheduleItem(rawItem);
				var monthMatch = item.date.match(/^(\d{4})-(\d{2})$/);

				if (!item.title) {
					return;
				}

				if (!item.date) {
					item.dateLabel = item.dateLabel || 'By request';
					addScheduleRequestFormat(item.trainingFormat || item.title, nextRequestFormats);
					if (!nextByRequestItem) {
						nextByRequestItem = item;
					}
					return;
				}

				if (/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
					nextExactDateItems.push(item);
					addScheduleRequestFormat(item.trainingFormat, nextRequestFormats);
					return;
				}

				if (monthMatch) {
					item.year = parseInt(monthMatch[1], 10);
					item.month = parseInt(monthMatch[2], 10) - 1;
					nextMonthlyItems.push(item);
					addScheduleRequestFormat(item.trainingFormat, nextRequestFormats);
				}
			});

			if (nextByRequestItem) {
				byRequestItem = nextByRequestItem;
			}
			monthlyItems = nextMonthlyItems;
			exactDateItems = nextExactDateItems;
			scheduleRequestFormats = nextRequestFormats;
			isScheduleLoading = false;
			renderSchedule();
		}

		function loadLiveScheduleItems() {
			if (typeof fetch !== 'function') {
				isScheduleLoading = false;
				renderSchedule();
				return;
			}

			fetch(scheduleEndpoint, {
				cache: 'no-store'
			})
			.then(function(response) {
				if (!response.ok) {
					throw new Error('Schedule request failed.');
				}
				return response.json();
			})
			.then(function(data) {
				if (!data || data.ok !== true || !Array.isArray(data.items)) {
					throw new Error('Schedule response was not valid.');
				}
				applyLiveScheduleItems(data.items);
			})
			.catch(function(error) {
				if (window.console && typeof window.console.warn === 'function') {
					window.console.warn('Live schedule could not be loaded. Using fallback schedule data.', error);
				}
				isScheduleLoading = false;
				renderSchedule();
			});
		}

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

		function getExactDateItemsForDate(dateKey) {
			return exactDateItems.filter(function(item) {
				return item.date === dateKey;
			});
		}

		function getExactDateItemsForMonth(year, month) {
			return exactDateItems.filter(function(item) {
				var itemDate = item.date.match(/^(\d{4})-(\d{2})-\d{2}$/);
				return itemDate &&
					parseInt(itemDate[1], 10) === year &&
					parseInt(itemDate[2], 10) === month + 1;
			});
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
			var selectedFormat = scheduleRequestFormats[0];
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

			scheduleRequestFormats.forEach(function(format) {
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

				if (!isMuted) {
					var dateKey = formatDateKey(new Date(cellYear, cellMonth, displayNumber));
					var dayExactItems = getExactDateItemsForDate(dateKey);
					if (dayExactItems.length) {
						day.className += ' is-today';
						day.setAttribute('data-schedule-event-date', dateKey);
					}
				}

				if (!isMuted && isSelectedDate(cellYear, cellMonth, displayNumber)) {
					day.className += ' is-selected';
					day.setAttribute('aria-pressed', 'true');
				} else if (!isMuted) {
					day.setAttribute('aria-pressed', 'false');
				}

				if (!isMuted) {
					var ariaLabel = 'Select ' + selectedDateFormatter.format(new Date(cellYear, cellMonth, displayNumber));
					if (dayExactItems && dayExactItems.length) {
						ariaLabel += ' - ' + dayExactItems.map(function(item) {
							return item.title;
						}).join(', ');
					}
					day.setAttribute('aria-label', ariaLabel);
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
			var visibleExactMonthItems = getExactDateItemsForMonth(year, month);
			var visibleExactItems = selectedDate ? exactDateItems.filter(function(item) {
				return item.date === formatDateKey(selectedDate);
			}) : [];

			eventsList.innerHTML = '';

			if (isScheduleLoading) {
				if (selectedDate) {
					var loadingSelectedLabel = document.createElement('p');
					loadingSelectedLabel.className = 'schedule-selected-date';
					loadingSelectedLabel.textContent = selectedDateFormatter.format(selectedDate);
					eventsList.appendChild(loadingSelectedLabel);
				}

				var loadingNote = document.createElement('p');
				loadingNote.className = 'schedule-empty-note';
				loadingNote.textContent = 'Loading schedule...';
				eventsList.appendChild(loadingNote);
				return;
			}

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

			if (visibleMonthlyItems.length || visibleExactMonthItems.length) {
				visibleMonthlyItems.forEach(function(item) {
					eventsList.appendChild(createEventItem(item));
				});
				visibleExactMonthItems.forEach(function(item) {
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
		loadLiveScheduleItems();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function() {
			initBookingTimePicker();
			initBookingFormSubmission();
			initPrograms();
			initScheduleCalendar();
		});
	} else {
		initBookingTimePicker();
		initBookingFormSubmission();
		initPrograms();
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

})(jQuery);
