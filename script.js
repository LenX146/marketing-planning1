(function() {
    // ===========================================
    //   STATE
    // ===========================================
    let currentDate = new Date();
    let selectedDate = new Date();
    let selectedKey = formatDateKey(selectedDate);

    let tasks = {};
    let projects = [];
    let archive = [];
    let goals = []; // [{ id, text }]
    let taskIdCounter = 1000;
    let projectIdCounter = 100;
    let goalIdCounter = 100;

    let editingGoalId = null;

    // ===========================================
    //   DOM
    // ===========================================
    const daysGrid = document.getElementById('daysGrid');
    const monthLabel = document.getElementById('monthLabel');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');
    const dayTag = document.getElementById('dayTag');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const newTaskInput = document.getElementById('newTaskInput');
    const taskStatus = document.getElementById('taskStatus');
    const archiveList = document.getElementById('archiveList');
    const projectList = document.getElementById('projectList');
    const projectInput = document.getElementById('projectInput');
    const projectCount = document.getElementById('projectCount');
    const todayBadge = document.getElementById('todayBadge');
    const goalsList = document.getElementById('goalsList');
    const goalsCount = document.getElementById('goalsCount');

    const addTaskBtn = document.getElementById('addTaskBtn');
    const clearTasksBtn = document.getElementById('clearTasksBtn');
    const archiveAllTasksBtn = document.getElementById('archiveAllTasksBtn');
    const resetBtn = document.getElementById('resetBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const clearArchiveBtn = document.getElementById('clearArchiveBtn');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');

    const addGoalBtn = document.getElementById('addGoalBtn');
    const goalModal = document.getElementById('goalModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelGoalBtn = document.getElementById('cancelGoalBtn');
    const saveGoalBtn = document.getElementById('saveGoalBtn');
    const goalTextInput = document.getElementById('goalTextInput');
    const modalTitle = document.getElementById('modalTitle');

    const totalTasks = document.getElementById('totalTasks');
    const totalProjects = document.getElementById('totalProjects');
    const totalArchived = document.getElementById('totalArchived');
    const daysWithTasks = document.getElementById('daysWithTasks');
    const futureDays = document.getElementById('futureDays');

    // ===========================================
    //   HELPERS
    // ===========================================
    function formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatDateDisplay(date) {
        const months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function isToday(date) {
        const t = new Date();
        return date.getFullYear() === t.getFullYear() &&
               date.getMonth() === t.getMonth() &&
               date.getDate() === t.getDate();
    }

    function isFuture(date) {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d > t;
    }

    function isPast(date) {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < t;
    }

    function isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    function generateTaskId() { return ++taskIdCounter; }
    function generateProjectId() { return ++projectIdCounter; }
    function generateGoalId() { return ++goalIdCounter; }

    function getTasksForDay(key) {
        if (!tasks[key]) tasks[key] = [];
        return tasks[key];
    }

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ===========================================
    //   ФУНКЦИЯ ДЛЯ ПРЕОБРАЗОВАНИЯ ТЕКСТА В HTML С ССЫЛКАМИ
    // ===========================================
    function linkifyText(text) {
        if (!text) return '';

        // Экранируем HTML
        let html = escapeHtml(text);

        // Ищем URL и превращаем их в ссылки
        // Поддерживаем http://, https://, www.
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        html = html.replace(urlRegex, function(url) {
            let href = url;
            // Если ссылка начинается с www., добавляем https://
            if (href.startsWith('www.')) {
                href = 'https://' + href;
            }
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
        });

        return html;
    }

    // ===========================================
    //   LOCAL STORAGE
    // ===========================================
    function loadAll() {
        try {
            const savedTasks = localStorage.getItem('sleng_tasks_v2');
            tasks = savedTasks ? JSON.parse(savedTasks) : {};

            const savedProjects = localStorage.getItem('sleng_projects');
            projects = savedProjects ? JSON.parse(savedProjects) : [];

            const savedArchive = localStorage.getItem('sleng_archive');
            archive = savedArchive ? JSON.parse(savedArchive) : [];

            const savedGoals = localStorage.getItem('sleng_goals_v4');
            goals = savedGoals ? JSON.parse(savedGoals) : [];

            if (Object.keys(tasks).length === 0 && projects.length === 0 && archive.length === 0 && goals.length === 0) {
                loadExample();
            }

            const today = new Date();
            selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            selectedKey = formatDateKey(selectedDate);
            currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } catch (e) { console.warn('Load error', e); loadExample(); }
    }

    function loadExample() {
        const today = new Date();
        const t = formatDateKey(today);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        tasks = {
            [t]: [
                { id: generateTaskId(), text: 'Согласовать макеты с дизайнером', done: false },
                { id: generateTaskId(), text: 'Запустить таргет на новую аудиторию', done: false },
                { id: generateTaskId(), text: 'Посмотреть аналитику https://analytics.google.com', done: false },
            ],
            [formatDateKey(tomorrow)]: [
                { id: generateTaskId(), text: 'Съёмка контента для новой коллекции', done: false },
                { id: generateTaskId(), text: 'Подготовить фото для сторис', done: false },
            ],
            [formatDateKey(dayAfter)]: [
                { id: generateTaskId(), text: 'Встреча с байерами в 11:00', done: false },
                { id: generateTaskId(), text: 'Подготовить рассылку для клиентов', done: false },
            ],
            [formatDateKey(nextWeek)]: [
                { id: generateTaskId(), text: 'Запуск рекламной кампании', done: false },
            ],
        };
        projects = [
            { id: generateProjectId(), name: 'Коллаборация с блогерами', status: 'active' },
            { id: generateProjectId(), name: 'Запуск новой коллекции', status: 'active' },
        ];
        archive = [
            { text: 'Съёмка лукбука с фотографом', date: '20 июня 2026' },
            { text: 'Запуск E-mail рассылки https://mailchimp.com', date: '18 июня 2026' },
        ];
        goals = [
            { id: generateGoalId(), text: 'Укрепить позиции бренда на рынке' },
            { id: generateGoalId(), text: 'Запустить новую коллекцию к концу месяца' },
            { id: generateGoalId(), text: 'Провести анализ конкурентов https://similarweb.com' },
        ];
        saveAll();
    }

    function saveAll() {
        localStorage.setItem('sleng_tasks_v2', JSON.stringify(tasks));
        localStorage.setItem('sleng_projects', JSON.stringify(projects));
        localStorage.setItem('sleng_archive', JSON.stringify(archive));
        localStorage.setItem('sleng_goals_v4', JSON.stringify(goals));
    }

    // ===========================================
    //   RENDER CALENDAR
    // ===========================================
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        let startOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

        const today = new Date();
        let html = '';

        const prevLast = new Date(year, month, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            html += `<div class="day-cell other-month">${prevLast - i}</div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const key = formatDateKey(dateObj);
            const isTodayDate = isToday(dateObj);
            const isSelected = isSameDay(dateObj, selectedDate);
            const hasTask = tasks[key] && tasks[key].length > 0;
            const isFutureDate = isFuture(dateObj);
            const isPastDate = isPast(dateObj);

            let classes = 'day-cell';
            if (isTodayDate) classes += ' today';
            if (isSelected) classes += ' selected';
            if (hasTask) classes += ' has-task';
            if (isFutureDate) classes += ' future';
            if (isPastDate) classes += ' past';

            html += `<div class="${classes}" data-key="${key}">${d}</div>`;
        }

        const totalCells = startOffset + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= remaining; d++) {
            html += `<div class="day-cell other-month">${d}</div>`;
        }

        daysGrid.innerHTML = html;

        const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
        monthLabel.innerHTML = `${monthNames[month]} <span>${year}</span>`;
        todayBadge.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDateDisplay(new Date())}`;

        document.querySelectorAll('.day-cell:not(.other-month)').forEach(cell => {
            cell.addEventListener('click', function() {
                const key = this.dataset.key;
                if (!key) return;
                const parts = key.split('-').map(Number);
                const newDate = new Date(parts[0], parts[1]-1, parts[2]);
                selectedDate = newDate;
                selectedKey = key;
                renderCalendar();
                updateDetailPanel();
                renderTasksForDay();
            });
        });
    }

    // ===========================================
    //   DETAIL PANEL
    // ===========================================
    function updateDetailPanel() {
        selectedDateDisplay.textContent = formatDateDisplay(selectedDate);
        if (isToday(selectedDate)) {
            dayTag.textContent = 'сегодня';
            dayTag.className = 'day-tag';
        } else if (isFuture(selectedDate)) {
            dayTag.textContent = '📅 будущее';
            dayTag.className = 'day-tag future-tag';
        } else {
            dayTag.textContent = 'прошлое';
            dayTag.className = 'day-tag';
        }
        renderTasksForDay();
    }

    // ===========================================
    //   RENDER TASKS FOR DAY (с поддержкой ссылок)
    // ===========================================
    function renderTasksForDay() {
        const key = selectedKey;
        const dayTasks = getTasksForDay(key);
        taskList.innerHTML = '';

        if (!dayTasks || dayTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-tasks">Нет задач</div>';
            taskCount.textContent = '0';
            return;
        }

        dayTasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item';
            const taskHtml = linkifyText(task.text);
            div.innerHTML = `
                <div class="task-check ${task.done ? 'done' : ''}" data-id="${task.id}">
                    ${task.done ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <span class="task-text ${task.done ? 'done-text' : ''}">${taskHtml}</span>
                <button class="task-delete" data-id="${task.id}"><i class="fas fa-times"></i></button>
            `;
            taskList.appendChild(div);
        });

        taskCount.textContent = dayTasks.length;

        document.querySelectorAll('.task-check').forEach(el => {
            el.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                toggleTaskDone(key, id);
            });
        });

        document.querySelectorAll('.task-delete').forEach(el => {
            el.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                deleteTask(key, id);
            });
        });

        updateStats();
    }

    // ===========================================
    //   TASK OPERATIONS
    // ===========================================
    function addTask() {
        const text = newTaskInput.value.trim();
        if (!text) { alert('Введите задачу'); return; }
        const key = selectedKey;
        const dayTasks = getTasksForDay(key);
        dayTasks.push({ id: generateTaskId(), text: text, done: false });
        saveAll();
        renderCalendar();
        renderTasksForDay();
        updateStats();
        newTaskInput.value = '';
        taskStatus.textContent = 'добавлено ✓';
        setTimeout(() => { taskStatus.textContent = 'сохранено'; }, 1000);
    }

    function toggleTaskDone(key, id) {
        const dayTasks = getTasksForDay(key);
        const task = dayTasks.find(t => t.id === id);
        if (task) {
            task.done = !task.done;
            saveAll();
            renderTasksForDay();
            updateStats();
        }
    }

    function deleteTask(key, id) {
        const dayTasks = getTasksForDay(key);
        const idx = dayTasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            dayTasks.splice(idx, 1);
            saveAll();
            renderTasksForDay();
            renderCalendar();
            updateStats();
        }
    }

    function clearTasksForDay() {
        const key = selectedKey;
        const dayTasks = getTasksForDay(key);
        if (dayTasks.length === 0) return;
        if (!confirm('Удалить все задачи на этот день?')) return;
        tasks[key] = [];
        saveAll();
        renderTasksForDay();
        renderCalendar();
        updateStats();
    }

    function archiveAllTasksForDay() {
        const key = selectedKey;
        const dayTasks = getTasksForDay(key);
        if (dayTasks.length === 0) { alert('Нет задач для архивирования'); return; }
        const displayDate = formatDateDisplay(selectedDate);
        dayTasks.forEach(task => {
            archive.push({ text: task.text, date: displayDate });
        });
        tasks[key] = [];
        saveAll();
        renderArchive();
        renderTasksForDay();
        renderCalendar();
        updateStats();
        taskStatus.textContent = 'архивировано!';
        setTimeout(() => { taskStatus.textContent = 'сохранено'; }, 1000);
    }

    // ===========================================
    //   GOALS (с поддержкой ссылок)
    // ===========================================
    function renderGoals() {
        goalsList.innerHTML = '';
        if (!goals || goals.length === 0) {
            goalsList.innerHTML = '<div class="empty-goals">Нет целей. Добавьте первую!</div>';
            goalsCount.textContent = '0';
            return;
        }

        goals.forEach(goal => {
            const div = document.createElement('div');
            div.className = 'goal-item';

            const goalHtml = linkifyText(goal.text);

            div.innerHTML = `
                <div class="goal-content">
                    <div class="goal-text">${goalHtml}</div>
                    <div class="goal-meta" style="font-size:11px; color:rgba(0,0,0,0.1); margin-top:2px;">ID: ${goal.id}</div>
                </div>
                <div class="goal-actions">
                    <button class="edit-goal" data-id="${goal.id}" title="Редактировать"><i class="fas fa-pen"></i></button>
                    <button class="delete-goal" data-id="${goal.id}" title="Удалить"><i class="fas fa-times"></i></button>
                </div>
            `;
            goalsList.appendChild(div);
        });

        goalsCount.textContent = goals.length;

        document.querySelectorAll('.edit-goal').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                openGoalEditor(id);
            });
        });

        document.querySelectorAll('.delete-goal').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                if (!confirm('Удалить эту цель?')) return;
                goals = goals.filter(g => g.id !== id);
                saveAll();
                renderGoals();
                updateStats();
            });
        });
    }

    function openGoalEditor(goalId = null) {
        editingGoalId = goalId;
        if (goalId) {
            const goal = goals.find(g => g.id === goalId);
            if (!goal) return;
            modalTitle.textContent = 'Редактировать цель';
            goalTextInput.value = goal.text;
        } else {
            modalTitle.textContent = 'Новая цель';
            goalTextInput.value = '';
        }
        goalModal.classList.add('active');
        setTimeout(() => goalTextInput.focus(), 100);
    }

    function closeGoalEditor() {
        goalModal.classList.remove('active');
        editingGoalId = null;
    }

    function saveGoal() {
        const text = goalTextInput.value.trim();
        if (!text) {
            alert('Введите текст цели');
            return;
        }

        if (editingGoalId) {
            const goal = goals.find(g => g.id === editingGoalId);
            if (goal) {
                goal.text = text;
            }
        } else {
            goals.push({ id: generateGoalId(), text: text });
        }

        saveAll();
        renderGoals();
        updateStats();
        closeGoalEditor();
    }

    // ===========================================
    //   PROJECTS
    // ===========================================
    function renderProjects() {
        projectList.innerHTML = '';
        if (!projects || projects.length === 0) {
            projectList.innerHTML = '<div class="empty-archive">Нет проектов</div>';
            projectCount.textContent = '0';
            return;
        }
        projects.forEach(p => {
            const div = document.createElement('div');
            div.className = 'project-item';
            div.innerHTML = `
                <span class="p-name">${escapeHtml(p.name)}</span>
                <div class="p-meta">
                    <span class="status-badge">${escapeHtml(p.status || 'active')}</span>
                    <button class="del-proj" data-id="${p.id}"><i class="fas fa-times"></i></button>
                </div>
            `;
            projectList.appendChild(div);
        });
        projectCount.textContent = projects.length;

        document.querySelectorAll('.del-proj').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                projects = projects.filter(p => p.id !== id);
                saveAll();
                renderProjects();
                updateStats();
            });
        });
    }

    function addProject() {
        const name = projectInput.value.trim();
        if (!name) { alert('Введите название проекта'); return; }
        projects.push({ id: generateProjectId(), name: name, status: 'active' });
        saveAll();
        renderProjects();
        updateStats();
        projectInput.value = '';
    }

    // ===========================================
    //   ARCHIVE (с поддержкой ссылок)
    // ===========================================
    function renderArchive() {
        archiveList.innerHTML = '';
        if (!archive || archive.length === 0) {
            archiveList.innerHTML = '<div class="empty-archive">Нет записей</div>';
            return;
        }
        const items = [...archive].reverse().slice(0, 12);
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'archive-item';
            const noteHtml = linkifyText(item.text);
            div.innerHTML = `
                <span class="note">${noteHtml}</span>
                <span class="note-date">${escapeHtml(item.date)}</span>
                <button class="del-btn archive-del" data-text="${escapeHtml(item.text)}"><i class="fas fa-times"></i></button>
            `;
            archiveList.appendChild(div);
        });

        document.querySelectorAll('.archive-del').forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.getAttribute('data-text');
                const idx = archive.findIndex(a => a.text === text);
                if (idx !== -1) {
                    archive.splice(idx, 1);
                    saveAll();
                    renderArchive();
                    updateStats();
                }
            });
        });
    }

    function clearArchive() {
        if (!confirm('Удалить все записи из архива?')) return;
        archive = [];
        saveAll();
        renderArchive();
        updateStats();
    }

    // ===========================================
    //   STATS
    // ===========================================
    function updateStats() {
        let total = 0;
        let daysWith = 0;
        for (const key in tasks) {
            if (tasks[key] && tasks[key].length > 0) {
                total += tasks[key].length;
                daysWith++;
            }
        }
        totalTasks.textContent = total;
        totalProjects.textContent = projects.length;
        totalArchived.textContent = archive.length;
        daysWithTasks.textContent = daysWith;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let futureCount = 0;
        for (const key in tasks) {
            if (!tasks[key] || tasks[key].length === 0) continue;
            const parts = key.split('-').map(Number);
            const d = new Date(parts[0], parts[1]-1, parts[2]);
            d.setHours(0, 0, 0, 0);
            if (d > today) futureCount++;
        }
        futureDays.textContent = futureCount;
    }

    // ===========================================
    //   RESET / CLEAR
    // ===========================================
    function resetExample() {
        if (!confirm('Сбросить все данные к примеру?')) return;
        loadExample();
        const today = new Date();
        selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        selectedKey = formatDateKey(selectedDate);
        currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        renderAll();
    }

    function clearAll() {
        if (!confirm('Удалить ВСЕ данные?')) return;
        tasks = {};
        projects = [];
        archive = [];
        goals = [];
        saveAll();
        renderAll();
    }

    // ===========================================
    //   NAVIGATION
    // ===========================================
    function changeMonth(delta) {
        currentDate.setMonth(currentDate.getMonth() + delta);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        if (selectedDate.getFullYear() !== year || selectedDate.getMonth() !== month) {
            let day = selectedDate.getDate();
            const lastDay = new Date(year, month+1, 0).getDate();
            if (day > lastDay) day = lastDay;
            selectedDate = new Date(year, month, day);
            selectedKey = formatDateKey(selectedDate);
        }
        renderAll();
    }

    // ===========================================
    //   RENDER ALL
    // ===========================================
    function renderAll() {
        renderCalendar();
        updateDetailPanel();
        renderTasksForDay();
        renderProjects();
        renderArchive();
        renderGoals();
        updateStats();
    }

    // ===========================================
    //   INIT
    // ===========================================
    function init() {
        const today = new Date();
        currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        selectedKey = formatDateKey(selectedDate);

        loadAll();
        renderAll();

        // Задачи
        addTaskBtn.addEventListener('click', addTask);
        newTaskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
        clearTasksBtn.addEventListener('click', clearTasksForDay);
        archiveAllTasksBtn.addEventListener('click', archiveAllTasksForDay);

        // Проекты
        addProjectBtn.addEventListener('click', addProject);
        projectInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addProject(); });

        // Цели
        addGoalBtn.addEventListener('click', () => openGoalEditor(null));
        closeModalBtn.addEventListener('click', closeGoalEditor);
        cancelGoalBtn.addEventListener('click', closeGoalEditor);
        saveGoalBtn.addEventListener('click', saveGoal);
        goalModal.addEventListener('click', function(e) {
            if (e.target === this) closeGoalEditor();
        });

        // Навигация
        resetBtn.addEventListener('click', resetExample);
        clearAllBtn.addEventListener('click', clearAll);
        clearArchiveBtn.addEventListener('click', clearArchive);
        prevMonth.addEventListener('click', () => changeMonth(-1));
        nextMonth.addEventListener('click', () => changeMonth(1));
    }

    init();
})();