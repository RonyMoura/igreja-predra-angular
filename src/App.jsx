// src/App.jsx
// Para que o navegador cons
// Deve-se instalar o Sistema de Roteamento - npm install react-router-dom

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Diaconato from './pages/Diaconato';// Ajuste o caminho se necessário
import Louvor from './pages/Louvor';
import Danca from './pages/danca';
import Jovens from './pages/Jovens';
import FormHistoricoCultos from './pages/FormHistoricoCultos';
import HistoricoCultos from './pages/HistoricoCulsto';
import { Login } from './pages/Login';
import PainelAdmin from './pages/PainelAdm';
import CelulaJesusSalva from './pages/CelulaJesusSalva';
import Tesouraria from './pages/Tesouraria';
import Secretaria from './pages/Secretaria';


function App() {
  return (
    <Router>
      <Routes>
        {/* Aqui você diz: "Se o endereço for '/', mostre a Home" */}
        <Route path="/" element={<Home />} />
        
        {/* Roteamento das páginas" */}
        <Route path="/diaconato" element={<Diaconato />} />
        <Route path="/louvor" element={<Louvor />} />
        <Route path="/danca" element={<Danca />} />
        <Route path="/jovens" element={<Jovens />} />
        <Route path="/formulario_cultos/:id?" element={<FormHistoricoCultos />} />
        <Route path="/historico_cultos" element={<HistoricoCultos />} />
        <Route path="/login2" element={<Login />} />
        <Route path="/painel" element={<PainelAdmin />} />
        <Route path="/celula_js" element={<CelulaJesusSalva />} />
        <Route path="/tesouraria" element={<Tesouraria />} />
        <Route path="/secretaria" element={<Secretaria />} />

        </Routes>
    </Router>
  );
}

export default App;

