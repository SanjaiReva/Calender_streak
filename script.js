document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const totalCountDisplay = document.getElementById('total-count');
    const monthYearDisplay = document.getElementById('month-year-display');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    const STORAGE_KEY = 'habit_tracker_data';
    let habitData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    const currentDate = today.getDate(); // Keep track of "today" for highlighting

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    function updateDateDisplay() {
        monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Initialize display
    updateDateDisplay();

    // Event Listeners for Month Navigation
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));

    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateDateDisplay();
        renderCalendar();
    }


    function getKey(day) {
        // Warning: This key needs to be consistent. 
        // Previously: `${currentYear}-${currentMonth}-${day}`
        // We must ensure 'currentMonth' is 0-indexed in the key if that's how it was stored.
        // JS getMonth() is 0-11, so yes.
        return `${currentYear}-${currentMonth}-${day}`;
    }

    function updateTotal() {
        // Calculate total for only THIS month currently viewed
        let total = 0;
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            total += (habitData[getKey(d)] || 0);
        }

        // Basic "animation" just by setting text
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

            // Highlight today only if we are in the current month/year
            if (day === currentDate &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear()) {
                dayCard.classList.add('today');
            }

            // HTML Structure of the card
            dayCard.innerHTML = `
                <span class="day-number">${day}</span>
                <span class="day-count" id="count-${day}">${count > 0 ? count : ''}</span>
            `;

            // Interaction Handlers: Click vs Double Click
            let clickCount = 0;
            let clickTimer = null;

            dayCard.addEventListener('click', (e) => {
                e.preventDefault(); // prevent unwanted behaviors
                clickCount++;

                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        // Single click action
                        clickCount = 0;
                        increment(day, dayCard);
                    }, 250); // 250ms delay to wait for potential second click
                } else if (clickCount === 2) {
                    // Double click action
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    decrement(day, dayCard);
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
            triggerAnim(card);
            saveData();

            // Haptic feedback if available (mobile)
            if (navigator.vibrate) navigator.vibrate(50);
        }
    }

    function updateCardVisuals(card, day, count) {
        const countSpan = card.querySelector('.day-count');
        countSpan.textContent = count > 0 ? count : '';

        if (count > 0) {
            dayCardSetActive(card, true);
        } else {
            dayCardSetActive(card, false);
        }
    }

    function dayCardSetActive(card, isActive) {
        if (isActive) card.classList.add('active');
        else card.classList.remove('active');
    }

    function triggerAnim(card) {
        card.classList.remove('pop-anim');
        void card.offsetWidth; // trigger reflow
        card.classList.add('pop-anim');
    }

    renderCalendar();
});
