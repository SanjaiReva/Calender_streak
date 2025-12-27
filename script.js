document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const totalCountDisplay = document.getElementById('total-count');
    const monthYearDisplay = document.getElementById('month-year-display');

    const STORAGE_KEY = 'habit_tracker_data';
    let habitData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDate = today.getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Helper: key for local storage per month to avoid massive keys? 
    // Actually, simple key "YYYY-MM-DD" is best.

    function getKey(day) {
        return `${currentYear}-${currentMonth}-${day}`;
    }

    function updateTotal() {
        // Calculate total for only THIS month
        let total = 0;
        // Logic: Iterate through all days of this month and sum up
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            total += (habitData[getKey(d)] || 0);
        }

        // Animate counter effect (basic)
        totalCountDisplay.textContent = total;
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(habitData));
        updateTotal();
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Padding for empty start days
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            calendarGrid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const key = getKey(day);
            const count = habitData[key] || 0;

            const dayCard = document.createElement('div');
            dayCard.classList.add('day-card');

            if (count > 0) dayCard.classList.add('active');
            if (day === currentDate) dayCard.classList.add('today');

            // HTML Structure of the card
            dayCard.innerHTML = `
                <span class="day-number">${day}</span>
                <span class="day-count" id="count-${day}">${count > 0 ? count : ''}</span>
            `;

            // Interaction Handlers
            let holdTimer;
            let isLongPress = false;

            // MOUSE EVENTS
            dayCard.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // Only left click
                isLongPress = false;
                holdTimer = setTimeout(() => {
                    isLongPress = true;
                    decrement(day, dayCard);
                    // Continue decrementing if holding?
                    // Optional: Setup interval for continuous decrement
                }, 500);
            });

            dayCard.addEventListener('mouseup', () => {
                clearTimeout(holdTimer);
                if (!isLongPress) {
                    increment(day, dayCard);
                }
            });

            dayCard.addEventListener('mouseleave', () => {
                clearTimeout(holdTimer);
            });

            // TOUCH EVENTS for mobile
            dayCard.addEventListener('touchstart', (e) => {
                isLongPress = false;
                holdTimer = setTimeout(() => {
                    isLongPress = true;
                    decrement(day, dayCard);
                    // Provide haptic feedback for long press trigger
                    if (navigator.vibrate) navigator.vibrate(50);
                }, 600); // Slightly longer for touch to avoid accidental triggers while scrolling
            }, { passive: true });

            dayCard.addEventListener('touchmove', () => {
                // If moving/scrolling, cancel the hold
                clearTimeout(holdTimer);
            });

            dayCard.addEventListener('touchend', (e) => {
                clearTimeout(holdTimer);
                e.preventDefault(); // Always prevent default to stop mouse emulation
                if (!isLongPress) {
                    increment(day, dayCard);
                }
            });

            calendarGrid.appendChild(dayCard);
        }

        updateTotal();
    }

    function increment(day, card) {
        const key = getKey(day);
        const currentVal = habitData[key] || 0;
        habitData[key] = currentVal + 1;

        updateCardVisuals(card, day, habitData[key]);
        triggerAnim(card);
        saveData();
    }

    function decrement(day, card) {
        const key = getKey(day);
        const currentVal = habitData[key] || 0;
        if (currentVal > 0) {
            habitData[key] = currentVal - 1;
            updateCardVisuals(card, day, habitData[key]);
            triggerAnim(card); // maybe different anim for decrease?
            saveData();

            // Haptic feedback if available (mobile)
            if (navigator.vibrate) navigator.vibrate(50);
        }
    }

    function updateCardVisuals(card, day, count) {
        const countSpan = card.querySelector('.day-count');
        countSpan.textContent = count > 0 ? count : '';

        if (count > 0) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    }

    function triggerAnim(card) {
        card.classList.remove('pop-anim');
        void card.offsetWidth; // trigger reflow
        card.classList.add('pop-anim');
    }

    renderCalendar();
});
