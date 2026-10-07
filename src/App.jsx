import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import './App.css'

const AppContext = createContext(null)

const initialTasks = [
  { id: 1, label: 'Read the React docs', done: true },
  { id: 2, label: 'Build a component with state', done: false },
  { id: 3, label: 'Share data with context', done: false },
]

function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('react-lab-theme') || 'light')
  const [tasks, setTasks] = useState(initialTasks)

  useEffect(() => {
    localStorage.setItem('react-lab-theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }, [])

  const addTask = useCallback((label) => {
    const cleanLabel = label.trim()
    if (!cleanLabel) return
    setTasks((currentTasks) => [...currentTasks, { id: Date.now(), label: cleanLabel, done: false }])
  }, [])

  const toggleTask = useCallback((id) => {
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === id ? { ...task, done: !task.done } : task
    )))
  }, [])

  return <AppContext.Provider value={{ theme, tasks, toggleTheme, addTask, toggleTask }}>{children}</AppContext.Provider>
}

function useApp() {
  return useContext(AppContext)
}

function useNavigation() {
  const [path, setPath] = useState(() => window.location.pathname || '/')

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname || '/')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextPath) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }, [])

  return { path, navigate }
}

function Navigation({ path, navigate }) {
  const { theme, toggleTheme } = useApp()
  const links = [{ path: '/', label: 'Overview' }, { path: '/patterns', label: 'Patterns' }]

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => navigate('/')}><span className="brand-mark">R</span><span>React lab</span></button>
      <nav aria-label="Primary navigation">
        {links.map((link) => <button className={path === link.path ? 'nav-link active' : 'nav-link'} key={link.path} type="button" onClick={() => navigate(link.path)}>{link.label}</button>)}
      </nav>
      <button className="theme-button" type="button" onClick={toggleTheme}>{theme === 'light' ? 'Night mode' : 'Day mode'}</button>
    </header>
  )
}

function Overview() {
  const { tasks, addTask, toggleTask } = useApp()
  const [draft, setDraft] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)
  const remaining = tasks.filter((task) => !task.done).length

  const handleSubmit = (event) => {
    event.preventDefault()
    addTask(draft)
    setDraft('')
  }

  const visibleTasks = showCompleted ? tasks : tasks.filter((task) => !task.done)

  return (
    <main>
      <section className="intro"><p className="eyebrow">A hands-on reference</p><h1>Small ideas, <em>composed</em> well.</h1><p className="lede">A working sketch of the React APIs you reach for every day. Change something and watch the whole tree respond.</p></section>
      <section className="workspace-grid">
        <article className="panel task-panel">
          <div className="panel-heading"><div><p className="panel-kicker">useState + useContext</p><h2>Study queue</h2></div><span className="count-badge">{remaining} open</span></div>
          <form className="task-form" onSubmit={handleSubmit}><input aria-label="New study task" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a concept to study" /><button type="submit">Add</button></form>
          <div className="task-list">{visibleTasks.map((task) => <label className={task.done ? 'task done' : 'task'} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span>{task.label}</span></label>)}</div>
          <button className="text-button" type="button" onClick={() => setShowCompleted((current) => !current)}>{showCompleted ? 'Hide completed' : 'Show all tasks'}</button>
        </article>
        <article className="panel effect-panel"><p className="panel-kicker">useEffect</p><h2>Side effects, contained.</h2><p>This app syncs your theme preference to local storage and updates the document theme after render.</p><div className="signal"><span className="signal-dot" /> Effect is listening</div><pre><code>{`useEffect(() => {\n  localStorage.setItem('theme', theme)\n}, [theme])`}</code></pre></article>
      </section>
    </main>
  )
}

function Patterns() {
  return <main><section className="intro compact-intro"><p className="eyebrow">The toolbox</p><h1>Patterns that <em>scale</em>.</h1><p className="lede">Each card below points to one decision this demo makes in code. Open the source and follow the data as it moves.</p></section><section className="pattern-grid"><article className="pattern-card"><span className="pattern-number">01</span><h2>Context</h2><p>Theme and queue actions are available to every descendant without prop drilling.</p><code>createContext(value)</code></article><article className="pattern-card"><span className="pattern-number">02</span><h2>Callback</h2><p>Actions keep a stable identity while still reading the freshest state.</p><code>useCallback(fn, deps)</code></article><article className="pattern-card"><span className="pattern-number">03</span><h2>Navigation</h2><p>Small apps can use the browser History API for clean, dependency-free pages.</p><code>history.pushState()</code></article></section></main>
}

function App() {
  const { path, navigate } = useNavigation()

  return (
    <AppProvider><div className="shell"><Navigation path={path} navigate={navigate} />{path === '/patterns' ? <Patterns /> : <Overview />}<footer><span>Built with React 19</span><span>State is a conversation between components.</span></footer></div></AppProvider>
  )
}

export default App
