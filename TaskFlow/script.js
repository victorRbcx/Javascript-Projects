
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'todas';
        this.searchTerm = '';
        this.editingTaskId = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.setTodayAsDefaultDate();
    }

    bindEvents() {
        // Botão adicionar tarefa
        const addBtn = document.getElementById('addTaskBtn');
        addBtn.addEventListener('click', () => this.handleAddTask());

        // Enter no input de tarefa
        const taskInput = document.getElementById('taskInput');
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTask();
            }
        });

        // Filtros
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.dataset.filter);
            });
        });

        // Busca
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderTasks();
        });

        // Modal
        const cancelBtn = document.getElementById('cancelBtn');
        cancelBtn.addEventListener('click', () => this.hideModal());

        // Fechar modal clicando fora
        const modal = document.getElementById('confirmModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    // Define a data de hoje como padrão no input de data
     
    setTodayAsDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDeadline').value = today;
    }

    // Manipula a adição/edição de tarefas

    handleAddTask() {
        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const categorySelect = document.getElementById('categorySelect');
        const deadlineInput = document.getElementById('taskDeadline');

        const title = taskInput.value.trim();
        const priority = prioritySelect.value;
        const category = categorySelect.value;
        const deadline = deadlineInput.value;

        if (!title) {
            this.showNotification('Por favor, digite o texto da tarefa!', 'error');
            taskInput.focus();
            return;
        }

        if (this.editingTaskId) {
            this.updateTask(this.editingTaskId, { title, priority, category, deadline });
            this.editingTaskId = null;
            document.getElementById('addTaskBtn').innerHTML = '<i class="fas fa-plus"></i> Adicionar';
        } else {
            this.addTask({ title, priority, category, deadline });
        }

        // Limpar formulário
        taskInput.value = '';
        prioritySelect.value = 'media';
        categorySelect.value = 'pessoal';
        this.setTodayAsDefaultDate();

        taskInput.focus();
    }

    // Adiciona uma nova tarefa
    addTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            priority: taskData.priority,
            category: taskData.category,
            deadline: taskData.deadline || null,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.showNotification('Tarefa adicionada com sucesso!', 'success');
    }

    // Atualiza uma tarefa existente
    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            this.showNotification('Tarefa atualizada com sucesso!', 'success');
        }
    }

    // Remove uma tarefa
    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.showConfirmModal(
            `Tem certeza que deseja excluir a tarefa "${task.title}"?`,
            () => {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('Tarefa excluída com sucesso!', 'success');
            }
        );
    }

    // Alterna o status de conclusão de uma tarefa
    toggleTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
            this.tasks[taskIndex].updatedAt = new Date().toISOString();

            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            const status = this.tasks[taskIndex].completed ? 'concluída' : 'reativada';
            this.showNotification(`Tarefa ${status}!`, 'info');
        }
    }

    // Inicia a edição de uma tarefa
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;

        // Preencher formulário
        document.getElementById('taskInput').value = task.title;
        document.getElementById('prioritySelect').value = task.priority;
        document.getElementById('categorySelect').value = task.category;
        document.getElementById('taskDeadline').value = task.deadline || '';

        // Alterar botão
        document.getElementById('addTaskBtn').innerHTML = '<i class="fas fa-save"></i> Salvar';

        // Focar no input
        document.getElementById('taskInput').focus();
        document.getElementById('taskInput').scrollIntoView({ behavior: 'smooth' });
    }

    // Define o filtro ativo
    setActiveFilter(filter) {
        this.currentFilter = filter;

        // Atualizar botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.renderTasks();
    }

    // Filtra as tarefas baseado no filtro atual e termo de busca
    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Aplicar filtro
        switch (this.currentFilter) {
            case 'pendentes':
                filtered = filtered.filter(task => !task.completed);
                break;
            case 'concluidas':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'alta':
                filtered = filtered.filter(task => task.priority === 'alta');
                break;
        }

        // Aplicar busca
        if (this.searchTerm) {
            filtered = filtered.filter(task => 
                task.title.toLowerCase().includes(this.searchTerm) ||
                task.category.toLowerCase().includes(this.searchTerm)
            );
        }

        // Ordenar: não concluídas primeiro, depois por prioridade
        return filtered.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }

            const priorityOrder = { 'alta': 0, 'media': 1, 'baixa': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    // Renderiza a lista de tarefas
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';

        container.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        // Vincular eventos dos botões
        this.bindTaskEvents();
    }

    // Cria o HTML para uma tarefa
    createTaskHTML(task) {
        const deadlineInfo = this.getDeadlineInfo(task.deadline);
        const categoryLabel = this.getCategoryLabel(task.category);

        return `
            <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>

                <div class="task-content">
                    <div class="task-title ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        <span class="task-category">${categoryLabel}</span>
                        ${deadlineInfo.html}
                        <span class="task-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${this.formatDate(task.createdAt)}
                        </span>
                    </div>
                </div>

                <div class="task-actions">
                    <button class="task-btn edit" title="Editar tarefa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete" title="Excluir tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Vincula eventos dos botões das tarefas
    bindTaskEvents() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = Number(e.target.closest('.task-item').dataset.taskId);
            this.toggleTask(taskId);
        });
    });

    document.querySelectorAll('.task-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = Number(btn.closest('.task-item').dataset.taskId);
            this.editTask(taskId);
        });
    });

    document.querySelectorAll('.task-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = Number(btn.closest('.task-item').dataset.taskId);
            this.deleteTask(taskId);
        });
    });
}

    // Obtém informações sobre o prazo da tarefa
    getDeadlineInfo(deadline) {
        if (!deadline) {
            return { html: '', isOverdue: false };
        }

        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let className = 'task-deadline';
        let icon = 'fas fa-clock';
        let text = this.formatDate(deadline, true);

        if (diffDays < 0) {
            className += ' overdue';
            icon = 'fas fa-exclamation-triangle';
            text += ` (${Math.abs(diffDays)} dias atrasado)`;
        } else if (diffDays === 0) {
            className += ' today';
            icon = 'fas fa-exclamation';
            text += ' (hoje)';
        } else if (diffDays === 1) {
            text += ' (amanhã)';
        }

        return {
            html: `<span class="${className}"><i class="${icon}"></i> ${text}</span>`,
            isOverdue: diffDays < 0
        };
    }

    // Obtém o rótulo da categoria
    getCategoryLabel(category) {
        const labels = {
            'pessoal': 'Pessoal',
            'trabalho': 'Trabalho',
            'estudos': 'Estudos',
            'saude': 'Saúde',
            'outros': 'Outros'
        };
        return labels[category] || category;
    }

    // Atualiza as estatísticas no cabeçalho
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    // Mostra o modal de confirmação
    showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const messageEl = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmBtn');

        messageEl.textContent = message;
        modal.classList.add('active');

        // Remover listados anteriores
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Adicionar nova lista
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.hideModal();
        });
    }

    // Esconde o modal
    hideModal() {
        document.getElementById('confirmModal').classList.remove('active');
    }

    // Mostra notificação (implementação simples)
    showNotification(message, type = 'info') {
        // Por simplicidade, usando alert. Em produção, implementaria um sistema de toast
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Você pode implementar um sistema de toast mais sofisticado aqui
        const originalTitle = document.title;
        document.title = `${message} - TaskFlow`;
        setTimeout(() => {
            document.title = originalTitle;
        }, 3000);
    }

    // Gera um ID único para as tarefas
    generateId() {
        return Date.now() + Math.random();
    }

    // Formata uma data para exibição
    formatDate(dateString, dateOnly = false) {
        const date = new Date(dateString);
        const options = dateOnly 
            ? { day: '2-digit', month: '2-digit', year: 'numeric' }
            : { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' };

        return date.toLocaleDateString('pt-BR', options);
    }

    // Escapa HTML para prevenir XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Carrega tarefas do localStorage
    loadTasks() {
        try {
            const tasksJson = localStorage.getItem('taskflow_tasks');
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    }

    // Salva tarefas no localStorage
    saveTasks() {
        try {
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
        }
    }

    // Exporta tarefas como JSON
    exportTasks() {
        const data = {
            tasks: this.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        this.showNotification('Tarefas exportadas com sucesso!', 'success');
    }

    // Limpa todas as tarefas concluídas
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;

        if (completedCount === 0) {
            this.showNotification('Não há tarefas concluídas para limpar.', 'info');
            return;
        }

        this.showConfirmModal(
            `Tem certeza que deseja excluir ${completedCount} tarefa(s) concluída(s)?`,
            () => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('Tarefas concluídas removidas!', 'success');
            }
        );
    }
}

// O que falta :

/**
 * TODO:
 * 
 * 1. Sistema de tags/etiquetas para tarefas
 * 2. Drag & drop para reordenar tarefas
 * 3. Subtarefas/checklist dentro de tarefas
 * 4. Modo escuro/claro
 * 5. Sincronização com APIs externas
 * 6. Notificações push
 * 7. Sistema de templates de tarefas
 * 8. Relatórios e estatísticas avançadas
 * 9. Filtros por data
 * 10. Anexos em tarefas
 * 11. Comentários em tarefas
 * 12. Sistema de colaboração/compartilhamento
 * 13. Integração com calendário
 * 14. Backup automático
 * 15. Atalhos de teclado
 * 16. Widgets de produtividade
 * 17. Integração com Pomodoro Timer
 * 18. Gamificação (pontos, conquistas)
 * 19. Temas personalizáveis
 * 20. PWA (Progressive Web App) features
 */

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();

    console.log('🚀 TaskFlow inicializado com sucesso!');
    console.log('💡 Este é um projeto open source. Contribua no GitHub!');
    console.log('🎯 Visite: https://github.com/your-repo/taskflow');
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter para adicionar tarefa rapidamente
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (window.taskManager) {
            window.taskManager.handleAddTask();
        }
    }

    // Esc para cancelar edição
    if (e.key === 'Escape') {
        if (window.taskManager && window.taskManager.editingTaskId) {
            window.taskManager.editingTaskId = null;
            document.getElementById('addTaskBtn').innerHTML = '<i class="fas fa-plus"></i> Adicionar';
            document.getElementById('taskInput').value = '';
        }
    }
});

// Prevenir perda de dados ao fechar a página
window.addEventListener('beforeunload', (e) => {
    const taskInput = document.getElementById('taskInput');
    if (taskInput && taskInput.value.trim()) {
        e.preventDefault();
        e.returnValue = 'Você tem uma tarefa não salva. Deseja realmente sair?';
    }
});