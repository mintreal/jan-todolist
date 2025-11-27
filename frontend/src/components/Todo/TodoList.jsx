import TodoItem from './TodoItem';

function TodoList({ todos, onToggle, onDelete, onUpdate }) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">할일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default TodoList;
