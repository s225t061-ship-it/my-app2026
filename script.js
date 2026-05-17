document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let diaryEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    let todoItems = JSON.parse(localStorage.getItem('todoItems')) || [];
    let selectedMood = 'happy';

    // --- DOM Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const diaryInput = document.getElementById('diary-input');
    const saveDiaryBtn = document.getElementById('save-diary');
    const diaryList = document.getElementById('diary-list');
    const moodBtns = document.querySelectorAll('.mood-btn');

    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    const todoStats = document.getElementById('todo-stats');

    // --- BGM Logic ---
    const bgmPlayer = document.getElementById('bgm-player');
    const bgmToggle = document.getElementById('bgm-toggle');
    let isPlaying = false;

    bgmToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgmPlayer.pause();
            bgmToggle.textContent = '🎵 OFF';
            bgmToggle.classList.remove('playing');
        } else {
            bgmPlayer.play().catch(e => console.log("BGM play failed:", e));
            bgmToggle.textContent = '🎵 ON';
            bgmToggle.classList.add('playing');
        }
        isPlaying = !isPlaying;
    });

    // --- Tab Logic ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // --- Mood Logic ---
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMood = btn.dataset.mood;
        });
    });

    function getMoodEmoji(mood) {
        const moods = {
            happy: '😊',
            neutral: '😐',
            sad: '😢'
        };
        return moods[mood] || '😊';
    }

    // --- Diary Logic ---
    function renderDiary() {
        diaryList.innerHTML = '';
        diaryEntries.slice().reverse().forEach((entry, index) => {
            const actualIndex = diaryEntries.length - 1 - index;
            const item = document.createElement('div');
            item.className = 'diary-item';
            item.innerHTML = `
                <span class="date">${entry.date}</span>
                <span class="mood-icon">${getMoodEmoji(entry.mood)}</span>
                <div class="content">${escapeHtml(entry.text)}</div>
                <button class="delete-btn" onclick="deleteDiary(${actualIndex})">削除</button>
            `;
            diaryList.appendChild(item);
        });
    }

    saveDiaryBtn.addEventListener('click', () => {
        const text = diaryInput.value.trim();
        if (!text) return;

        const newEntry = {
            text: text,
            mood: selectedMood,
            date: new Date().toLocaleString('ja-JP', { 
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit' 
            })
        };

        diaryEntries.push(newEntry);
        localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
        diaryInput.value = '';
        renderDiary();
    });

    window.deleteDiary = (index) => {
        diaryEntries.splice(index, 1);
        localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
        renderDiary();
    };

    // --- TODO Logic ---
    function renderTodo() {
        todoList.innerHTML = '';
        let completedCount = 0;

        todoItems.forEach((todo, index) => {
            if (todo.completed) completedCount++;
            
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${index})">
                <span class="content">${escapeHtml(todo.text)}</span>
                <button class="delete-btn" onclick="deleteTodo(${index})">削除</button>
            `;
            todoList.appendChild(li);
        });

        todoStats.textContent = `${completedCount} / ${todoItems.length} 完了`;
    }

    addTodoBtn.addEventListener('click', () => {
        const text = todoInput.value.trim();
        if (!text) return;

        todoItems.push({ text, completed: false });
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
        todoInput.value = '';
        renderTodo();
    });

    window.toggleTodo = (index) => {
        todoItems[index].completed = !todoItems[index].completed;
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
        renderTodo();
    };

    window.deleteTodo = (index) => {
        todoItems.splice(index, 1);
        localStorage.setItem('todoItems', JSON.stringify(todoItems));
        renderTodo();
    };

    // --- Utilities ---
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initial Render
    renderDiary();
    renderTodo();
});
