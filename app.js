const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskPriority = document.getElementById('task-priority');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const clearCompletedBtn = document.getElementById('clear-completed');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');
const progressBar = document.getElementById('progress-bar');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let editTaskId = null;
let dragStartIndex = null;
let currentFilter = 'all';

renderTasks();

addBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const date = taskDate.value;
    const priority = taskPriority.value;
    if (!text) return;
    if (editTaskId) {
        tasks = tasks.map(t => t.id === editTaskId ? {...t, text, date, priority} : t);
        editTaskId = null;
        addBtn.textContent = 'Add';
    } else { tasks.push({ id: Date.now(), text, date, priority, completed: false }); }
    updateLocalStorage();
    renderTasks();
    taskInput.value = '';
    taskDate.value = '';
});

function renderTasks() {
    taskList.innerHTML = '';
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
        return task.priority === currentFilter;
    });
    const searchText = searchInput.value.toLowerCase();
    filteredTasks = filteredTasks.filter(t => t.text.toLowerCase().includes(searchText));
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.setAttribute('draggable', true);
        li.dataset.index = index;
        li.dataset.priority = task.priority;
        li.innerHTML = `<div><span>${task.text}</span> ${task.date ? `<small>(${task.date})</small>` : ''}</div>
            <div class="task-buttons">
                <button class="complete-btn">✔</button>
                <button class="edit-btn">✎</button>
                <button class="delete-btn">✖</button>
            </div>`;
        li.querySelector('.complete-btn').addEventListener('click', () => { task.completed = !task.completed; updateLocalStorage(); renderTasks(); });
        li.querySelector('.edit-btn').addEventListener('click', () => { taskInput.value = task.text; taskDate.value = task.date; taskPriority.value = task.priority; editTaskId = task.id; addBtn.textContent = 'Update'; taskInput.focus(); });
        li.querySelector('.delete-btn').addEventListener('click', () => { li.style.opacity = '0'; setTimeout(() => { tasks = tasks.filter(t => t.id !== task.id); updateLocalStorage(); renderTasks(); }, 300); });
        li.addEventListener('dragstart', dragStart);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('drop', dragDrop);
        li.addEventListener('dragend', dragEnd);
        if (task.date && !task.completed) { const today = new Date().toISOString().split('T')[0]; if (task.date === today) { li.style.border = "2px solid #ff1744"; li.style.boxShadow = "0 0 10px #ff1744"; } }
        taskList.appendChild(li);
    });
    updateProgressBar();
}

function updateProgressBar() {
    if (tasks.length === 0) { progressBar.style.width = '0%'; return; }
    const completedCount = tasks.filter(t => t.completed).length;
    const percent = Math.round((completedCount / tasks.length) * 100);
    progressBar.style.width = `${percent}%`;
}

filterBtns.forEach(btn => { btn.addEventListener('click', () => { currentFilter = btn.dataset.filter; renderTasks(); }); });
searchInput.addEventListener('input', renderTasks);
clearCompletedBtn.addEventListener('click', () => { tasks = tasks.filter(t => !t.completed); updateLocalStorage(); renderTasks(); });
darkModeToggle.addEventListener('click', () => document.body.classList.toggle('dark'));
exportBtn.addEventListener('click', () => { const dataStr = JSON.stringify(tasks, null, 2); const blob = new Blob([dataStr], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'tasks.json'; a.click(); URL.revokeObjectURL(url); });
importBtn.addEventListener('click', () => importInput.click());
importInput.addEventListener('change', (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const importedTasks = JSON.parse(reader.result); tasks = importedTasks; updateLocalStorage(); renderTasks(); } catch { alert("Invalid JSON file"); } }; reader.readAsText(file); });
function updateLocalStorage() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
function dragStart(e) { dragStartIndex = +this.dataset.index; this.classList.add('dragging'); }
function dragOver(e) { e.preventDefault(); }
function dragDrop() { const dragEndIndex = +this.dataset.index; [tasks[dragStartIndex], tasks[dragEndIndex]] = [tasks[dragEndIndex], tasks[dragStartIndex]]; updateLocalStorage(); renderTasks(); }
function dragEnd() { this.classList.remove('dragging'); }
