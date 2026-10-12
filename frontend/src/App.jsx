import Navbar from './components/Navbar.jsx';
import DashboardView from './pages/DashboardView.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <DashboardView />
      </main>
    </>
  );
}
