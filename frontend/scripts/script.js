// URL base da API Spring Boot
const API_URL = "http://localhost:8080";

// Evento executado automaticamente assim que toda a estrutura do documento HTML for carregada
document.addEventListener("DOMContentLoaded", () => {
    getTasks(); // Chama a função para buscar e listar as tarefas do usuário logado (Read)
});

// Helper para obter o token JWT do localStorage com validação
function getAuthToken() {
    const token = localStorage.getItem("Authorization");
    if (!token) {
        alert("Acesso não autorizado! Faça login primeiro.");
        window.location.href = "login.html";
        return null;
    }
    return token;
}

// =========================================================================
// READ (Listar Tarefas): GET /task/user
// =========================================================================
async function getTasks() {
    const token = getAuthToken();
    if (!token) return;

    // Exibe o spinner de carregamento na tela
    document.getElementById("loading").style.display = "block";

    try {
        // Envia requisição GET para o endpoint /task/user passando o token no cabeçalho Authorization
        const response = await fetch(`${API_URL}/task/user`, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        // Se o token for aceito pela API (Status 200 OK)
        if (response.ok) {
            // Converte a resposta recebida (TaskProjection) em um array JavaScript
            const tasks = await response.json();
            renderTasks(tasks);
        } else if (response.status === 403 || response.status === 401) {
            // Se o token tiver expirado ou for inválido
            alert("Sessão expirada. Por favor, faça login novamente.");
            logout();
        } else {
            alert("Erro ao buscar tarefas do servidor.");
        }
    } catch (error) {
        console.error("Erro na busca de tarefas:", error);
        alert("Erro de conexão com o servidor.");
    } finally {
        // Oculta o spinner de carregamento após concluir a requisição
        document.getElementById("loading").style.display = "none";
    }
}

// Renderiza a lista de tarefas no DOM incluindo os botões de ação (Editar e Excluir)
function renderTasks(tasks) {
    const tasksList = document.getElementById("tasks-list");
    tasksList.innerHTML = "";

    // Se a lista retornada estiver vazia
    if (!Array.isArray(tasks) || tasks.length === 0) {
        tasksList.innerHTML = `<li class="list-group-item text-center text-muted py-4">Nenhuma tarefa cadastrada. Adicione sua primeira tarefa acima!</li>`;
        return;
    }

    // Percorre cada objeto do tipo TaskProjection (possuindo apenas id e description)
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center py-3";

        // Texto da descrição da tarefa
        const descSpan = document.createElement("span");
        descSpan.className = "me-3 flex-grow-1 text-break";
        descSpan.textContent = task.description;

        // Container dos botões de ação
        const btnGroup = document.createElement("div");
        btnGroup.className = "btn-group btn-group-sm flex-shrink-0";

        // Botão de Editar (Update)
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-outline-primary";
        editBtn.title = "Editar tarefa";
        editBtn.innerHTML = `<i class="bi bi-pencil-fill me-1"></i>Editar`;
        editBtn.onclick = () => openEditModal(task.id, task.description);

        // Botão de Excluir (Delete)
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-outline-danger";
        deleteBtn.title = "Excluir tarefa";
        deleteBtn.innerHTML = `<i class="bi bi-trash-fill me-1"></i>Excluir`;
        deleteBtn.onclick = () => deleteTask(task.id);

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);

        li.appendChild(descSpan);
        li.appendChild(btnGroup);

        tasksList.appendChild(li);
    });
}

// =========================================================================
// CREATE (Criar Nova Tarefa): POST /task
// =========================================================================
async function createTask(event) {
    event.preventDefault(); // Evita recarregamento da página

    const token = getAuthToken();
    if (!token) return;

    const inputDesc = document.getElementById("new-task-description");
    const description = inputDesc.value.trim();

    if (!description) {
        alert("Por favor, informe a descrição da tarefa.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/task`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ description })
        });

        // 201 Created indica que a tarefa foi criada com sucesso
        if (response.ok || response.status === 201) {
            inputDesc.value = ""; // Limpa o campo de entrada
            getTasks(); // Atualiza a lista de tarefas
        } else if (response.status === 401 || response.status === 403) {
            alert("Sessão expirada. Por favor, faça login novamente.");
            logout();
        } else {
            alert("Não foi possível criar a tarefa. Verifique os dados informados.");
        }
    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        alert("Erro de conexão ao criar a tarefa.");
    }
}

// =========================================================================
// UPDATE (Atualizar Tarefa): PUT /task/{id}
// =========================================================================
// Abre o modal de edição preenchendo os dados da tarefa selecionada
function openEditModal(id, currentDescription) {
    document.getElementById("edit-task-id").value = id;
    document.getElementById("edit-task-description").value = currentDescription;

    const modalElement = document.getElementById("editTaskModal");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Submete a atualização da tarefa para a API
async function updateTask(event) {
    event.preventDefault(); // Evita o recarregamento da página

    const token = getAuthToken();
    if (!token) return;

    const taskId = document.getElementById("edit-task-id").value;
    const newDescription = document.getElementById("edit-task-description").value.trim();

    if (!newDescription) {
        alert("A descrição da tarefa não pode estar vazia.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/task/${taskId}`, {
            method: "PUT",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ description: newDescription })
        });

        // 204 No Content indica sucesso na atualização
        if (response.ok || response.status === 204) {
            // Fecha o modal do Bootstrap
            const modalElement = document.getElementById("editTaskModal");
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

            getTasks(); // Recarrega a lista com os dados atualizados
        } else if (response.status === 401 || response.status === 403) {
            alert("Sessão expirada ou sem permissão para editar esta tarefa.");
            logout();
        } else {
            alert("Erro ao atualizar a tarefa.");
        }
    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        alert("Erro de conexão ao atualizar a tarefa.");
    }
}

// =========================================================================
// DELETE (Excluir Tarefa): DELETE /task/{id}
// =========================================================================
async function deleteTask(id) {
    // Diálogo de confirmação para evitar exclusões acidentais
    const confirmDelete = confirm("Tem certeza de que deseja excluir esta tarefa?");
    if (!confirmDelete) return;

    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/task/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": token
            }
        });

        // 204 No Content indica exclusão bem-sucedida
        if (response.ok || response.status === 204) {
            getTasks(); // Recarrega a lista de tarefas
        } else if (response.status === 401 || response.status === 403) {
            alert("Sessão expirada ou sem permissão para excluir esta tarefa.");
            logout();
        } else {
            alert("Erro ao excluir a tarefa.");
        }
    } catch (error) {
        console.error("Erro ao excluir tarefa:", error);
        alert("Erro de conexão ao excluir a tarefa.");
    }
}

// =========================================================================
// LOGOUT
// =========================================================================
function logout() {
    // Remove o token JWT do localStorage
    localStorage.removeItem("Authorization");

    // Redireciona o usuário para a página de autenticação
    window.location.href = "login.html";
}