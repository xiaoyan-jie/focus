import './App.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import CreateActivity from './CreateActivity';
import CompleteActivity from './CompleteActivity';
import ViewActivity from './ViewActivity';

function App() {
  
  return (
    <HashRouter>
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route exact path="/create" element={<CreateActivity/>}/>
        <Route exact path="/complete" element={<CompleteActivity/>}/>
        <Route exact path="/view" element={<ViewActivity/>}/>
      </Routes>
    </HashRouter>
  );
}

export default App;
