import { useEffect, useRef } from 'react';

interface HeaderProps {
  newTodoTitle: string;
  setNewTodoTitle: (title: string) => void;
  createTodo: (title: string) => Promise<void>;
  todosLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  newTodoTitle,
  setNewTodoTitle,
  createTodo,
  todosLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [createTodo]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createTodo(newTodoTitle);
  };

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
      />

      {/* Add a todo on form submit */}
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTodoTitle}
          onChange={event => setNewTodoTitle(event.target.value)}
          disabled={todosLoading}
        />
      </form>
    </header>
  );
};
