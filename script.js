(function() {
    // ===========================================
    //   СОСТОЯНИЕ
    // ===========================================
    let currentDate = new Date();
    let selectedDate = new Date();
    let selectedKey = formatDateKey(selectedDate);

    let tasks = {};
    let projects = [];
    let archive = [];
    let goals = [];
    let collections = [];
    let marketing = [];

    let taskIdCounter = 1000;
    let projectIdCounter = 100;
    let goalIdCounter = 100;
    let collectionIdCounter = 100;
    let ideaIdCounter = 1000;
    let marketingIdCounter = 2000;

    let editingGoalId = null;
    let editingCollectionId = null;
    let editingMarketingId = null;

    let isSyncing = false;
    let isInitialLoad = true;

    // ===========================================
    //   DOM
    // ===========================================
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = {
        main: document.getElementById('page-main'),
        collections: document.getElementById('page-collections'),
        marketing: document.getElementById('page-marketing')
    };

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
    const syncStatus = document.getElementById('syncStatus');

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

    const collectionsGrid = document.getElementById('collectionsGrid');
    const addCollectionBtn = document.getElementById('addCollectionBtn');

    const collectionModal = document.getElementById('collectionModal');
    const closeCollectionModalBtn = document.getElementById('closeCollectionModalBtn');
    const cancelCollectionBtn = document.getElementById('cancelCollectionBtn');
    const saveCollectionBtn = document.getElementById('saveCollectionBtn');
    const collectionNameInput = document.getElementById('collectionNameInput');
    const collectionModalTitle = document.getElementById('collectionModalTitle');

    const editCollectionModal = document.getElementById('editCollectionModal');
    const closeEditCollectionModalBtn = document.getElementById('closeEditCollectionModalBtn');
    const cancelEditCollectionBtn = document.getElementById('cancelEditCollectionBtn');
    const saveEditCollectionBtn = document.getElementById('saveEditCollectionBtn');
    const editCollectionNameInput = document.getElementById('editCollectionNameInput');
    const editCollectionModalTitle = document.getElementById('editCollectionModalTitle');

    const marketingGrid = document.getElementById('marketingGrid');
    const addMarketingBtn = document.getElementById('addMarketingBtn');

    const marketingModal = document.getElementById('marketingModal');
    const closeMarketingModalBtn = document.getElementById('closeMarketingModalBtn');
    const cancelMarketingBtn = document.getElementById('cancelMarketingBtn');
    const saveMarketingBtn = document.getElementById('saveMarketingBtn');
    const marketingTitleInput = document.getElementById('marketingTitleInput');
    const marketingDescInput = document.getElementById('marketingDescInput');
    const marketingCategoryInput = document.getElementById('marketingCategoryInput');
    const marketingPriorityInput = document.getElementById('marketingPriorityInput');
    const marketingStatusInput = document.getElementById('marketingStatusInput');
    const marketingModalTitle = document.getElementById('marketingModalTitle');

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

    function getTodayString() {
        const now = new Date();
        const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
        return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
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
    function generateCollectionId() { return ++collectionIdCounter; }
    function generateIdeaId() { return ++ideaIdCounter; }
    function generateMarketingId() { return ++marketingIdCounter; }

    function getTasksForDay(key) {
        if (!tasks[key]) tasks[key] = [];
        return tasks[key];
    }

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ============================================
    //   ГЛАВНАЯ ФУНКЦИЯ ДЛЯ ССЫЛОК
    //   ПРЕОБРАЗУЕТ ТЕКСТ В HTML С КЛИКАБЕЛЬНЫМИ ССЫЛКАМИ
    // ============================================
    function linkifyText(text) {
        if (!text) return '';
        let html = escapeHtml(text);
        // Ищем URL: http://, https://, www.
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        html = html.replace(urlRegex, function(url) {
            let href = url;
            if (href.startsWith('www.')) {
                href = 'https://' + href;
            }
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
        });
        return html;
    }

    // ===========================================
    //   СИНХРОНИЗАЦИЯ С FIREBASE
    // ===========================================
    const USER_ID = 'sleng_owner';

    function setSyncStatus(status, message) {
        if (!syncStatus) return;
        syncStatus.className = 'sync-status';
        if (status === 'synced') {
            syncStatus.classList.add('synced');
            syncStatus.innerHTML = `<i class="fas fa-check-circle"></i> Синхронизировано`;
        } else if (status === 'loading') {
            syncStatus.innerHTML = `<i class="fas fa-sync fa-spin"></i> Загрузка...`;
        } else if (status === 'error') {
            syncStatus.classList.add('error');
            syncStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message || 'Ошибка'}`;
        } else {
            syncStatus.innerHTML = `<i class="fas fa-sync fa-spin"></i> Синхронизация...`;
        }
    }

    function saveToFirebase() {
        if (isSyncing) return;
        isSyncing = true;
        setSyncStatus('loading');

        const data = {
            tasks: tasks,
            projects: projects,
            archive: archive,
            goals: goals,
            collections: collections,
            marketing: marketing,
            counters: {
                taskIdCounter: taskIdCounter,
                projectIdCounter: projectIdCounter,
                goalIdCounter: goalIdCounter,
                collectionIdCounter: collectionIdCounter,
                ideaIdCounter: ideaIdCounter,
                marketingIdCounter: marketingIdCounter
            },
            updatedAt: Date.now()
        };

        database.ref('users/' + USER_ID).set(data)
            .then(() => {
                setSyncStatus('synced');
                isSyncing = false;
            })
            .catch((error) => {
                console.error('Ошибка сохранения:', error);
                setSyncStatus('error', 'Ошибка сохранения');
                isSyncing = false;
            });
    }

    function loadFromFirebase() {
        setSyncStatus('loading');
        
        database.ref('users/' + USER_ID).once('value')
            .then((snapshot) => {
                const data = snapshot.val();
                if (data) {
                    tasks = data.tasks || {};
                    projects = data.projects || [];
                    archive = data.archive || [];
                    goals = data.goals || [];
                    collections = data.collections || [];
                    marketing = data.marketing || [];
                    
                    if (data.counters) {
                        taskIdCounter = data.counters.taskIdCounter || 1000;
                        projectIdCounter = data.counters.projectIdCounter || 100;
                        goalIdCounter = data.counters.goalIdCounter || 100;
                        collectionIdCounter = data.counters.collectionIdCounter || 100;
                        ideaIdCounter = data.counters.ideaIdCounter || 1000;
                        marketingIdCounter = data.counters.marketingIdCounter || 2000;
                    }
                    
                    setSyncStatus('synced');
                    isInitialLoad = false;
                    renderAll();
                } else {
                    loadExample();
                    saveToFirebase();
                }
            })
            .catch((error) => {
                console.error('Ошибка загрузки:', error);
                setSyncStatus('error', 'Ошибка загрузки');
                loadFromLocalStorage();
            });
    }

    function listenToFirebase() {
        database.ref('users/' + USER_ID).on('value', (snapshot) => {
            if (isSyncing) return;
            const data = snapshot.val();
            if (data) {
                tasks = data.tasks || {};
                projects = data.projects || [];
                archive = data.archive || [];
                goals = data.goals || [];
                collections = data.collections || [];
                marketing = data.marketing || [];
                
                if (data.counters) {
                    taskIdCounter = data.counters.taskIdCounter || 1000;
                    projectIdCounter = data.counters.projectIdCounter || 100;
                    goalIdCounter = data.counters.goalIdCounter || 100;
                    collectionIdCounter = data.counters.collectionIdCounter || 100;
                    ideaIdCounter = data.counters.ideaIdCounter || 1000;
                    marketingIdCounter = data.counters.marketingIdCounter || 2000;
                }
                
                if (!isInitialLoad) {
                    renderAll();
                }
                isInitialLoad = false;
                setSyncStatus('synced');
            }
        });
    }

    // ===========================================
    //   LOCAL STORAGE (FALLBACK)
    // ===========================================
    function loadFromLocalStorage() {
        try {
            const savedTasks = localStorage.getItem('sleng_tasks_v2');
            tasks = savedTasks ? JSON.parse(savedTasks) : {};

            const savedProjects = localStorage.getItem('sleng_projects');
            projects = savedProjects ? JSON.parse(savedProjects) : [];

            const savedArchive = localStorage.getItem('sleng_archive');
            archive = savedArchive ? JSON.parse(savedArchive) : [];

            const savedGoals = localStorage.getItem('sleng_goals_v4');
            goals = savedGoals ? JSON.parse(savedGoals) : [];

            const savedCollections = localStorage.getItem('sleng_collections');
            collections = savedCollections ? JSON.parse(savedCollections) : [];

            const savedMarketing = localStorage.getItem('sleng_marketing');
            marketing = savedMarketing ? JSON.parse(savedMarketing) : [];

            if (Object.keys(tasks).length === 0 && projects.length === 0 && archive.length === 0 && goals.length === 0 && collections.length === 0 && marketing.length === 0) {
                loadExample();
            }
        } catch (e) { console.warn('Load error', e); loadExample(); }
    }

    // ===========================================
    //   ПРИМЕР ДАННЫХ
    // ===========================================
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
        collections = [
            { 
                id: generateCollectionId(), 
                name: 'Осень-Зима 2026',
                ideas: [
                    { id: generateIdeaId(), text: 'Пальто оверсайз с крупными пуговицами' },
                    { id: generateIdeaId(), text: 'Шерстяной костюм с широкими брюками' },
                    { id: generateIdeaId(), text: 'Вдохновение https://www.pinterest.com' },
                ]
            },
            { 
                id: generateCollectionId(), 
                name: 'Весна-Лето 2027',
                ideas: [
                    { id: generateIdeaId(), text: 'Льняное платье с цветочным принтом' },
                    { id: generateIdeaId(), text: 'Лёгкий блейзер из хлопка' },
                ]
            },
        ];
        marketing = [
            {
                id: generateMarketingId(),
                title: 'Коллаборация с микро-инфлюенсерами',
                description: 'Привлечь 10 микро-инфлюенсеров для создания UGC-контента. Подробнее: https://influencer.com',
                category: 'social',
                priority: 'high',
                status: 'active',
                date: getTodayString()
            },
            {
                id: generateMarketingId(),
                title: 'Email-рассылка о новой коллекции',
                description: 'Создать серию из 3 писем для базы подписчиков: анонс, предзаказ и день запуска. Использовать персонализированные предложения.',
                category: 'email',
                priority: 'medium',
                status: 'planning',
                date: getTodayString()
            },
        ];
    }

    // ===========================================
    //   НАВИГАЦИЯ
    // ===========================================
    function switchPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            switchPage(this.dataset.page);
        });
    });

    // ===========================================
    //   RENDER ФУНКЦИИ
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
            el.removeEventListener('click', handleTaskCheck);
            el.addEventListener('click', handleTaskCheck);
        });

        document.querySelectorAll('.task-delete').forEach(el => {
            el.removeEventListener('click', handleTaskDelete);
            el.addEventListener('click', handleTaskDelete);
        });

        updateStats();
    }

    function handleTaskCheck(e) {
        e.stopPropagation();
        const el = e.currentTarget;
        const id = Number(el.dataset.id);
        const key = selectedKey;
        toggleTaskDone(key, id);
    }

    function handleTaskDelete(e) {
        e.stopPropagation();
        const el = e.currentTarget;
        const id = Number(el.dataset.id);
        const key = selectedKey;
        deleteTask(key, id);
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
        saveToFirebase();
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
            saveToFirebase();
            renderTasksForDay();
            updateStats();
        }
    }

    function deleteTask(key, id) {
        const dayTasks = getTasksForDay(key);
        const idx = dayTasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            dayTasks.splice(idx, 1);
            saveToFirebase();
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
        saveToFirebase();
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
        saveToFirebase();
        renderArchive();
        renderTasksForDay();
        renderCalendar();
        updateStats();
        taskStatus.textContent = 'архивировано!';
        setTimeout(() => { taskStatus.textContent = 'сохранено'; }, 1000);
    }

    // ===========================================
    //   GOALS
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
                saveToFirebase();
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

        saveToFirebase();
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
                saveToFirebase();
                renderProjects();
                updateStats();
            });
        });
    }

    function addProject() {
        const name = projectInput.value.trim();
        if (!name) { alert('Введите название проекта'); return; }
        projects.push({ id: generateProjectId(), name: name, status: 'active' });
        saveToFirebase();
        renderProjects();
        updateStats();
        projectInput.value = '';
    }

    // ===========================================
    //   ARCHIVE
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
                    saveToFirebase();
                    renderArchive();
                    updateStats();
                }
            });
        });
    }

    function clearArchive() {
        if (!confirm('Удалить все записи из архива?')) return;
        archive = [];
        saveToFirebase();
        renderArchive();
        updateStats();
    }

    // ===========================================
    //   COLLECTIONS — ИСПРАВЛЕНО! ССЫЛКИ РАБОТАЮТ
    // ===========================================
    function renderCollections() {
        collectionsGrid.innerHTML = '';
        if (!collections || collections.length === 0) {
            collectionsGrid.innerHTML = `
                <div class="empty-goals" style="grid-column:1/-1; text-align:center; padding:40px 0;">
                    Нет коллекций. Создайте первую!
                </div>
            `;
            return;
        }

        collections.forEach(collection => {
            const card = document.createElement('div');
            card.className = 'collection-card';

            let ideasHtml = '';
            if (collection.ideas && collection.ideas.length > 0) {
                collection.ideas.forEach(idea => {
                    // ← ПРИМЕНЯЕМ linkifyText() ДЛЯ КАЖДОЙ ИДЕИ!
                    const ideaHtml = linkifyText(idea.text);
                    ideasHtml += `
                        <div class="idea-item">
                            <span class="idea-bullet">•</span>
                            <span class="idea-text">${ideaHtml}</span>
                            <button class="idea-delete" data-collection-id="${collection.id}" data-idea-id="${idea.id}"><i class="fas fa-times"></i></button>
                        </div>
                    `;
                });
            } else {
                ideasHtml = `<div class="empty-ideas">Нет идей для этой коллекции</div>`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <span class="collection-name">${escapeHtml(collection.name)}</span>
                    <div class="card-actions">
                        <button class="edit-collection" data-id="${collection.id}" title="Редактировать"><i class="fas fa-pen"></i></button>
                        <button class="delete-collection" data-id="${collection.id}" title="Удалить"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    ${ideasHtml}
                    <div class="add-idea-row">
                        <input type="text" placeholder="Добавить идею..." class="idea-input" data-collection-id="${collection.id}" />
                        <button class="add-idea-btn" data-collection-id="${collection.id}"><i class="fas fa-plus"></i> Добавить</button>
                    </div>
                    <div class="idea-count">${collection.ideas ? collection.ideas.length : 0} идей</div>
                </div>
            `;
            collectionsGrid.appendChild(card);
        });

        document.querySelectorAll('.delete-collection').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                if (!confirm('Удалить коллекцию и все её идеи?')) return;
                collections = collections.filter(c => c.id !== id);
                saveToFirebase();
                renderCollections();
                updateStats();
            });
        });

        document.querySelectorAll('.edit-collection').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                openEditCollectionModal(id);
            });
        });

        document.querySelectorAll('.add-idea-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const collectionId = Number(this.dataset.collectionId);
                const input = this.parentElement.querySelector('.idea-input');
                const text = input.value.trim();
                if (!text) { alert('Введите идею'); return; }
                addIdea(collectionId, text);
                input.value = '';
            });
        });

        document.querySelectorAll('.idea-input').forEach(input => {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    const collectionId = Number(this.dataset.collectionId);
                    const text = this.value.trim();
                    if (!text) return;
                    addIdea(collectionId, text);
                    this.value = '';
                }
            });
        });

        document.querySelectorAll('.idea-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const collectionId = Number(this.dataset.collectionId);
                const ideaId = Number(this.dataset.ideaId);
                deleteIdea(collectionId, ideaId);
            });
        });
    }

    function addIdea(collectionId, text) {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection) return;
        if (!collection.ideas) collection.ideas = [];
        collection.ideas.push({ id: generateIdeaId(), text: text });
        saveToFirebase();
        renderCollections();
        updateStats();
    }

    function deleteIdea(collectionId, ideaId) {
        const collection = collections.find(c => c.id === collectionId);
        if (!collection || !collection.ideas) return;
        collection.ideas = collection.ideas.filter(i => i.id !== ideaId);
        saveToFirebase();
        renderCollections();
        updateStats();
    }

    // ===========================================
    //   COLLECTION MODALS
    // ===========================================
    function openCollectionModal() {
        collectionModalTitle.textContent = 'Новая коллекция';
        collectionNameInput.value = '';
        collectionModal.classList.add('active');
        setTimeout(() => collectionNameInput.focus(), 100);
    }

    function closeCollectionModal() {
        collectionModal.classList.remove('active');
    }

    function saveCollection() {
        const name = collectionNameInput.value.trim();
        if (!name) { alert('Введите название коллекции'); return; }
        collections.push({ id: generateCollectionId(), name: name, ideas: [] });
        saveToFirebase();
        renderCollections();
        updateStats();
        closeCollectionModal();
    }

    function openEditCollectionModal(id) {
        const collection = collections.find(c => c.id === id);
        if (!collection) return;
        editingCollectionId = id;
        editCollectionModalTitle.textContent = 'Редактировать коллекцию';
        editCollectionNameInput.value = collection.name;
        editCollectionModal.classList.add('active');
        setTimeout(() => editCollectionNameInput.focus(), 100);
    }

    function closeEditCollectionModal() {
        editCollectionModal.classList.remove('active');
        editingCollectionId = null;
    }

    function saveEditCollection() {
        const name = editCollectionNameInput.value.trim();
        if (!name) { alert('Введите название коллекции'); return; }
        const collection = collections.find(c => c.id === editingCollectionId);
        if (collection) {
            collection.name = name;
            saveToFirebase();
            renderCollections();
            updateStats();
        }
        closeEditCollectionModal();
    }

    // ===========================================
    //   MARKETING — ИСПРАВЛЕНО! ССЫЛКИ РАБОТАЮТ
    // ===========================================
    function renderMarketing() {
        marketingGrid.innerHTML = '';
        if (!marketing || marketing.length === 0) {
            marketingGrid.innerHTML = `
                <div class="empty-goals" style="grid-column:1/-1; text-align:center; padding:40px 0;">
                    Нет маркетинговых идей. Добавьте первую!
                </div>
            `;
            return;
        }

        const sorted = [...marketing].reverse();

        sorted.forEach(idea => {
            const card = document.createElement('div');
            card.className = 'marketing-card';

            // ← ПРИМЕНЯЕМ linkifyText() ДЛЯ ОПИСАНИЯ!
            const descHtml = linkifyText(idea.description || '');

            const categoryLabels = {
                'content': '📝 Контент',
                'social': '📱 Соцсети',
                'email': '✉️ Email',
                'ads': '📢 Реклама',
                'pr': '🤝 PR',
                'events': '🎪 Мероприятия',
                'research': '🔍 Исследования',
                'other': '📌 Другое'
            };
            const categoryLabel = categoryLabels[idea.category] || idea.category || '📌 Другое';

            const statusLabels = {
                'idea': '💡 Идея',
                'planning': '📋 В разработке',
                'active': '🚀 Активно',
                'completed': '✅ Реализовано',
                'archived': '📦 В архиве'
            };
            const statusLabel = statusLabels[idea.status] || idea.status || '💡 Идея';

            const priorityClass = idea.priority === 'high' ? 'priority-high' : 
                                  idea.priority === 'medium' ? 'priority-medium' : 'priority-low';
            const statusClass = 'status-' + (idea.status || 'idea');

            card.innerHTML = `
                <div class="card-header">
                    <span class="idea-title">${escapeHtml(idea.title)}</span>
                    <div class="card-actions">
                        <button class="edit-marketing" data-id="${idea.id}" title="Редактировать"><i class="fas fa-pen"></i></button>
                        <button class="delete-marketing" data-id="${idea.id}" title="Удалить"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="idea-description">${descHtml}</div>
                    <div class="idea-meta">
                        <span class="tag">${categoryLabel}</span>
                        <span class="tag ${priorityClass}">${idea.priority === 'high' ? '🔥' : idea.priority === 'medium' ? '📊' : '💤'} ${idea.priority === 'high' ? 'Высокий' : idea.priority === 'medium' ? 'Средний' : 'Низкий'}</span>
                        <span class="tag ${statusClass}">${statusLabel}</span>
                        <span class="idea-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(idea.date || '')}</span>
                    </div>
                </div>
            `;
            marketingGrid.appendChild(card);
        });

        document.querySelectorAll('.delete-marketing').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                if (!confirm('Удалить эту маркетинговую идею?')) return;
                marketing = marketing.filter(m => m.id !== id);
                saveToFirebase();
                renderMarketing();
                updateStats();
            });
        });

        document.querySelectorAll('.edit-marketing').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = Number(this.dataset.id);
                openMarketingEditor(id);
            });
        });
    }

    function openMarketingEditor(id = null) {
        editingMarketingId = id;
        if (id) {
            const idea = marketing.find(m => m.id === id);
            if (!idea) return;
            marketingModalTitle.textContent = 'Редактировать маркетинговую идею';
            marketingTitleInput.value = idea.title;
            marketingDescInput.value = idea.description || '';
            marketingCategoryInput.value = idea.category || 'other';
            marketingPriorityInput.value = idea.priority || 'medium';
            marketingStatusInput.value = idea.status || 'idea';
        } else {
            marketingModalTitle.textContent = 'Новая маркетинговая идея';
            marketingTitleInput.value = '';
            marketingDescInput.value = '';
            marketingCategoryInput.value = 'other';
            marketingPriorityInput.value = 'medium';
            marketingStatusInput.value = 'idea';
        }
        marketingModal.classList.add('active');
        setTimeout(() => marketingTitleInput.focus(), 100);
    }

    function closeMarketingEditor() {
        marketingModal.classList.remove('active');
        editingMarketingId = null;
    }

    function saveMarketing() {
        const title = marketingTitleInput.value.trim();
        const description = marketingDescInput.value.trim();
        if (!title) {
            alert('Введите заголовок идеи');
            return;
        }

        const data = {
            title: title,
            description: description,
            category: marketingCategoryInput.value,
            priority: marketingPriorityInput.value,
            status: marketingStatusInput.value,
            date: getTodayString()
        };

        if (editingMarketingId) {
            const idea = marketing.find(m => m.id === editingMarketingId);
            if (idea) {
                idea.title = data.title;
                idea.description = data.description;
                idea.category = data.category;
                idea.priority = data.priority;
                idea.status = data.status;
            }
        } else {
            data.id = generateMarketingId();
            marketing.push(data);
        }

        saveToFirebase();
        renderMarketing();
        updateStats();
        closeMarketingEditor();
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
        if (!confirm('Сбросить все данные к примеру? Данные в облаке будут перезаписаны!')) return;
        loadExample();
        const today = new Date();
        selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        selectedKey = formatDateKey(selectedDate);
        currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        saveToFirebase();
        renderAll();
    }

    function clearAll() {
        if (!confirm('Удалить ВСЕ данные? Это действие необратимо!')) return;
        tasks = {};
        projects = [];
        archive = [];
        goals = [];
        collections = [];
        marketing = [];
        saveToFirebase();
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
        renderCollections();  // ← Теперь ссылки работают!
        renderMarketing();    // ← Теперь ссылки работают!
        updateStats();
    }

    // ===========================================
    //   INIT
    // ===========================================
    function initApp() {
        const today = new Date();
        currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        selectedKey = formatDateKey(selectedDate);

        loadFromFirebase();
        listenToFirebase();

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

        // Коллекции
        addCollectionBtn.addEventListener('click', openCollectionModal);
        closeCollectionModalBtn.addEventListener('click', closeCollectionModal);
        cancelCollectionBtn.addEventListener('click', closeCollectionModal);
        saveCollectionBtn.addEventListener('click', saveCollection);
        collectionModal.addEventListener('click', function(e) {
            if (e.target === this) closeCollectionModal();
        });

        closeEditCollectionModalBtn.addEventListener('click', closeEditCollectionModal);
        cancelEditCollectionBtn.addEventListener('click', closeEditCollectionModal);
        saveEditCollectionBtn.addEventListener('click', saveEditCollection);
        editCollectionModal.addEventListener('click', function(e) {
            if (e.target === this) closeEditCollectionModal();
        });

        // Маркетинг
        addMarketingBtn.addEventListener('click', () => openMarketingEditor(null));
        closeMarketingModalBtn.addEventListener('click', closeMarketingEditor);
        cancelMarketingBtn.addEventListener('click', closeMarketingEditor);
        saveMarketingBtn.addEventListener('click', saveMarketing);
        marketingModal.addEventListener('click', function(e) {
            if (e.target === this) closeMarketingEditor();
        });

        // Навигация
        resetBtn.addEventListener('click', resetExample);
        clearAllBtn.addEventListener('click', clearAll);
        clearArchiveBtn.addEventListener('click', clearArchive);
        prevMonth.addEventListener('click', () => changeMonth(-1));
        nextMonth.addEventListener('click', () => changeMonth(1));
    }

    // Ждём загрузку Firebase и запускаем приложение
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        // Приложение запустится после ввода PIN-кода
        // Функция initApp будет вызвана из index.html
        console.log('✅ Firebase готов, ожидаем PIN-код...');
    } else {
        console.log('⏳ Ожидание загрузки Firebase...');
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                console.log('✅ Firebase загружен, ожидаем PIN-код...');
            } else {
                console.error('❌ Firebase не загружен! Проверьте подключение SDK.');
            }
        });
    }

})();