import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<h1>Hello MatrixHue</h1>} />
      </Routes>
    </div>
  );
}
