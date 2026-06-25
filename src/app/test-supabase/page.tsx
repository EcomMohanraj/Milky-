import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 font-outfit">Supabase Todos Test</h1>
      <ul className="list-disc pl-5">
        {todos?.map((todo) => (
          <li key={todo.id} className="text-sm font-semibold">{todo.name}</li>
        ))}
      </ul>
      {(!todos || todos.length === 0) && (
        <p className="text-xs text-muted-foreground italic">No todos found or table does not exist yet.</p>
      )}
    </div>
  )
}
