import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/lobby/:id" element={<Lobby />} />
      <Route path="/game/:id" element={<Game />} />
    </Routes>
  );
}
export default App;
