document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority-select');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const clockElement = document.getElementById('mil-clock');
    const taskCountElement = document.getElementById('task-count');
    const todoFooter = document.getElementById('todo-footer');
    const clearCompletedBtn = document.getElementById('clear-completed');

    // Real-time Clock
    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clockElement.innerText = now.toLocaleDateString('en-US', options).toUpperCase();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks_v2')) || [];

    function saveTasks() {
        localStorage.setItem('tasks_v2', JSON.stringify(tasks));
        updateStats();
    }

    function updateStats() {
        const activeTasks = tasks.filter(t => !t.completed).length;
        taskCountElement.innerText = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
        todoFooter.style.display = tasks.length > 0 ? 'flex' : 'none';
    }

    function renderTasks() {
        todoList.innerHTML = '';
        
        // Sort: High priority first, then medium, then low
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        sortedTasks.forEach((task) => {
            const originalIndex = tasks.indexOf(task);
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-content" onclick="toggleTask(${originalIndex})">
                    <div class="checkbox-custom">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="task-text">
                        <span class="task-main-text">${task.text}</span>
                        <div class="task-meta">
                            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                            <span>Added ${task.timestamp}</span>
                        </div>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask(event, ${originalIndex})">
                    <i class="far fa-trash-alt"></i>
                </button>
            `;
            todoList.appendChild(li);
        });
        updateStats();
    }

    window.addTask = () => {
        const text = todoInput.value.trim();
        const priority = prioritySelect.value;
        if (text) {
            const now = new Date();
            const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            tasks.push({ 
                text, 
                completed: false, 
                priority,
                timestamp,
                createdAt: now.getTime()
            });
            
            todoInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    window.toggleTask = (index) => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    };

    window.deleteTask = (event, index) => {
        event.stopPropagation();
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
    });

    addBtn.addEventListener('click', addTask);
    
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    renderTasks();
});
