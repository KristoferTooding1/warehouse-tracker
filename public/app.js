async function loadTasks() {
     const res = await fetch('/tasks');
     const tasks = await res.json();

     const list = document.getElementById('task-list');
     list.innerHTML = '';

     tasks.forEach(task => {
     const li = document.createElement('li');
     li.textContent = `${task.title} — ${task.status} (${task.assigned_to ?? 'unassigned'}) `;

     if (task.status !== 'done') {
       const btn = document.createElement('button');
       btn.textContent = 'Mark done';
       btn.addEventListener('click', async () => {
         await fetch(`/tasks/${task.id}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status: 'done' })
         });
         loadTasks();
       });
       li.appendChild(btn);
     }

     list.appendChild(li);
   });
   }

   loadTasks();

document.getElementById('task-form').addEventListener('submit', async (e) => {
     e.preventDefault(); 

     const titleInput = document.getElementById('title');
     const title = titleInput.value.trim();

     if (!title) return;

     await fetch('/tasks', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ title })
     });

     titleInput.value = '';
     loadTasks();
});