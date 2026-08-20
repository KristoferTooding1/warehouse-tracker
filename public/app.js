async function loadTasks() {
  const res = await fetch('/tasks');
  const tasks = await res.json();

  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';

    const left = document.createElement('div');
    left.className = 'task-left';

    const checkbox = document.createElement('div');
    checkbox.className = task.status === 'done' ? 'status-checkbox checked' : 'status-checkbox';
    checkbox.addEventListener('click', async () => {
      const newStatus = task.status === 'done' ? 'pending' : 'done';
      await fetch(`/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadTasks();
    });

    const title = document.createElement('span');
    title.className = task.status === 'done' ? 'task-title done' : 'task-title';
    title.textContent = task.title;

    left.appendChild(checkbox);
    left.appendChild(title);

    const assignee = task.assigned_to ? task.assigned_to.toLowerCase() : 'unassigned';
    const badge = document.createElement('span');
    badge.className = `assignee-badge ${assignee}`;
    badge.textContent = task.assigned_to ?? 'Unassigned';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      await fetch(`/tasks/${task.id}`, { method: 'DELETE' });
      loadTasks();
    });

    li.appendChild(left);
    li.appendChild(badge);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

loadTasks();

async function loadWorkers() {
  const res = await fetch('/workers');
  const workers = await res.json();

  const select = document.getElementById('worker-select');
  workers.forEach(worker => {
    const option = document.createElement('option');
    option.value = worker.id;
    option.textContent = worker.name;
    select.appendChild(option);
  });
}

loadWorkers();

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById('title');
  const workerSelect = document.getElementById('worker-select');
  const title = titleInput.value.trim();
  const worker_id = workerSelect.value || null;

  if (!title) return;

  await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, worker_id })
  });

  titleInput.value = '';
  workerSelect.value = '';
  loadTasks();
});