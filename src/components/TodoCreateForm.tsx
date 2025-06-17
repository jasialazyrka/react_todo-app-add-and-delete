import { Dispatch, forwardRef, SetStateAction, useState } from 'react';
import { ErrorMessages } from '../types/ErrorMessages';
import { Todo } from '../types/Todo';

interface TodoCreateFormProps {
  onSubmit: (title: string) => Promise<Todo>;
  onError: Dispatch<SetStateAction<ErrorMessages | null>>;
  todosLoading: boolean;
}

export const TodoCreateForm = forwardRef<HTMLInputElement, TodoCreateFormProps>(
  ({ onSubmit, onError, todosLoading }, ref) => {
    const [newTodoTitle, setNewTodoTitle] = useState<string>('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newTodoTitle.trim()) {
        onError(ErrorMessages.EmptyTitle);

        return;
      }

      onSubmit(newTodoTitle).then(() => setNewTodoTitle(''));
    };

    return (
      <form onSubmit={handleSubmit}>
        <input
          ref={ref}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTodoTitle}
          onChange={event => setNewTodoTitle(event.target.value.trimStart())}
          disabled={todosLoading}
        />
      </form>
    );
  },
);

TodoCreateForm.displayName = 'TodoCreateForm';
