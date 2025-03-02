import React, { useEffect, useState } from 'react';
import { fetchTodos, Todo, TodoResponse } from './api';



const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    fetchTodos()
      .then((data: TodoResponse) => {
        setTodos(data.todos);
        setUsername(data.user.username);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{username}'s Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo} className="mb-2 p-2 border rounded">
            {todo}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
