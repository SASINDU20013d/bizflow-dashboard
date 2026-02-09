import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Projects from './pages/Projects'
import Finance from './pages/Finance'
import Subscriptions from './pages/Subscriptions'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="projects" element={<Projects />} />
        <Route path="finance" element={<Finance />} />
        <Route path="subscriptions" element={<Subscriptions />} />
      </Route>
    </Routes>
  )
}

export default App
