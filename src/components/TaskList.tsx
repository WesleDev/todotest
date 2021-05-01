import { useCallback, useState, useEffect } from "react";
import api from "../services/api";
import "../styles/task.scss";

interface Task {
  id?: number;
  titulo?: string;
  descricao?: string;
  isComplete?: boolean;
}
export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payload, setPayload] = useState<Task>({});
  const [isEdit, setIsEdit] = useState(false);

  const handleGetTasks = useCallback(() => {
    api
      .get("/tarefas")
      .then(({ data }) => {
        setTasks(data);
      })
      .catch(() => {
        alert("Erro ao consultar suas tarefas, tente novamente mais tarde");
      });
  }, []);

  function handleCreateNewTask() {
    // Cria uma nova task, não permite criar caso o título seja vazio.
    if (!payload.titulo) return;
    const newTask = { ...payload, isComplete: false };

    api
      .post("/tarefas", newTask)
      .then(() => {
        setPayload({ titulo: "", descricao: "" });
        handleGetTasks();
      })
      .catch(() => {
        alert("Erro ao criar nova tarefa, tente novamente mais tarde");
      });
  }

  const handleSetEditValues = useCallback((task) => {
    setIsEdit(true);
    setPayload(task);
  }, []);

  const handleEditTask = useCallback(() => {
    api
      .put(`tarefas/${payload.id}`, payload)
      .then(() => {
        setPayload({ titulo: "", descricao: "" });
        handleGetTasks();
        setIsEdit(false);
      })
      .catch((erro) => {
        console.log(erro);
      });
  }, [payload, handleGetTasks]);

  function handleToggleTaskCompletion(task: any) {
    // Altera entre `true` ou `false` o campo `isComplete` de uma task com dado ID
    api
      .put(`tarefas/${task.id}`, {
        ...task,
        isComplete: Boolean(!task.isComplete),
      })
      .then(() => {
        handleGetTasks();
      });
  }

  function handleRemoveTask(id: number | undefined) {
    api
      .delete(`tarefas/${id}`)
      .then((data) => {
        console.log(data);
        handleGetTasks();
      })
      .catch((erro) => {
        console.log(erro);
      });
  }

  useEffect(() => {
    handleGetTasks();
  }, [handleGetTasks]);

  return (
    <>
      <header className="header">
        <div>
          <h2>MINHAS TASKS</h2>
        </div>
      </header>
      
      <section className="task-list container">
        <header>
          <div className="input-group">
            <input
              type="text"
              placeholder="Titulo"
              onChange={(e) =>
                setPayload({ ...payload, titulo: e.target.value })
              }
              value={payload?.titulo}
            />{" "}
            {""}
            <input
              type="text"
              placeholder="Descrição"
              onChange={(e) =>
                setPayload({ ...payload, descricao: e.target.value })
              }
              value={payload?.descricao}
            />
          </div>
          {isEdit ? (
            <button
              type="submit"
              data-testid="add-task-button"
              onClick={handleEditTask}
            >
              Salvar
            </button>
          ) : (
            <button
              type="submit"
              data-testid="add-task-button"
              onClick={handleCreateNewTask}
            >
              Adicionar
            </button>
          )}
        </header>

        <main>
          <ul>
            {tasks.map((task: Task) => (
              <li key={task.id}>
                <div
                  className={task.isComplete ? "completed" : ""}
                  data-testid="task"
                >
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      readOnly
                      checked={task.isComplete}
                      onClick={() => handleToggleTaskCompletion(task)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <p>{task.titulo}</p> -<p>{task.descricao}</p>
                </div>
                <div>
                  <button
                    type="button"
                    data-testid="remove-task-button"
                    onClick={() => handleSetEditValues(task)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete"
                    type="button"
                    data-testid="remove-task-button"
                    onClick={() => handleRemoveTask(task.id)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </section>
    </>
  );
}
