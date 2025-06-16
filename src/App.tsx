/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID, addTodo, deleteTodo } from './api/todos';
import { Todo } from './types/Todo';
import { ErrorMessages } from './types/ErrorMessages';
import { ErrorNotification } from './components/ErrorNotification';
import { TodoItem } from './components/TodoItem';
import { StatusFilterOptions } from './types/StatusFilterOptions';
import { FilterByStatus } from './components/FilterByStatus';
import { Header } from './components/Header';

interface GetFilteredTodosFilter {
  status: StatusFilterOptions;
}

const getFilteredTodos = (todos: Todo[], filter: GetFilteredTodosFilter) => {
  let filteredTodos = [...todos];

  if (filter.status !== StatusFilterOptions.All) {
    filteredTodos = filteredTodos.filter(todo => {
      return filter.status === StatusFilterOptions.Completed
        ? todo.completed
        : !todo.completed;
    });
  }

  return filteredTodos;
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<ErrorMessages | null>(null);

  const [filterStatus, setFilterStatus] = useState<StatusFilterOptions>(
    StatusFilterOptions.All,
  );

  const [processingTodoIds, setProcessingTodoIds] = useState<Todo['id'][]>([]); //All Todos that processing at the momemnt

  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  useEffect(() => {
    async function loadTodos() {
      try {
        const data = await getTodos();

        setTodos(data);
      } catch (error) {
        setErrorMessage(ErrorMessages.UnableToLoad);
      } finally {
        setTodosLoading(false);
      }
    }

    loadTodos();
  }, []);

  const handleCreateTodo = async (title: string): Promise<void> => {
    //creatingTodo
    if (!title.trim()) {
      setErrorMessage(ErrorMessages.EmptyTitle);

      return;
    }

    setTodosLoading(true);

    const newTodo = {
      id: 0,
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    };

    setTempTodo(newTodo);

    try {
      const createdTodo = await addTodo(newTodo);

      setTodos(currentTodos => [...currentTodos, createdTodo]);
      setNewTodoTitle('');
    } catch {
      setErrorMessage(ErrorMessages.AddTodo);
    } finally {
      setTodosLoading(false);
      setTempTodo(null);
    }
  };

  const handleDeleteTodo = async (todoId: Todo['id']) => {
    setProcessingTodoIds(currentIds => [...currentIds, todoId]);

    try {
      await deleteTodo(todoId);
      setTodos(todos => todos.filter(todo => todo.id !== todoId));
    } catch {
      setErrorMessage(ErrorMessages.DeleteTodo);
    } finally {
      setProcessingTodoIds(currentIds =>
        currentIds.filter(id => id !== todoId),
      );
    }
  };

  const completedTodos = todos.filter(todo => todo.completed);
  const activeTodos = todos.length - completedTodos.length;

  const handleHideError = useCallback(() => setErrorMessage(null), []);

  const showFooter = todos.length > 0;

  const filteredTodos = getFilteredTodos(todos, {
    status: filterStatus,
  });

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
          createTodo={handleCreateTodo}
          todosLoading={todosLoading}
        />
        {!todosLoading && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              {filteredTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onDeleteTodo={handleDeleteTodo}
                />
              ))}
              {/* <div data-cy="Todo" className="todo">
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                  />
                </label>

              {/* This form is shown instead of the title and remove button */}
              {/* <form>
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    value="Todo is being edited now"
                  />
                </form> */}

              {/* <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div> */}
            </section>

            {showFooter && (
              <footer className="todoapp__footer" data-cy="Footer">
                <span className="todo-count" data-cy="TodosCounter">
                  {activeTodos} items left
                </span>

                <FilterByStatus
                  statusFilter={filterStatus}
                  onStatusFilterChange={setFilterStatus}
                />

                {/* this button should be disabled if there are no completed todos */}
                <button
                  type="button"
                  className="todoapp__clear-completed"
                  data-cy="ClearCompletedButton"
                  disabled={completedTodos.length === 0}
                  onClick={() => {
                    completedTodos.forEach(todo => handleDeleteTodo(todo.id));
                  }}
                >
                  Clear completed
                </button>
              </footer>
            )}
          </>
        )}
      </div>
      <ErrorNotification
        onHideError={handleHideError}
        errorMessage={errorMessage}
      />
    </div>
  );
};
