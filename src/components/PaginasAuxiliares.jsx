// src/components/PaginasAuxiliares.jsx
// Componente para padronizar as páginas auxiliares

import { Link, useLocation, useNavigate } from "react-router-dom"; /*Trata-se de um link de navegação interna*/
import { supabase } from "../supabaseClient"; /* Importamos o cliente do banco para gerenciar a sessão */

export default function PaginasAuxiliares({destino, sessao}) {

  const navigate = useNavigate(); // Cria a função para redirecionar o usuário depois
  
    const handleLogout = async () => {
    await supabase.auth.signOut(); // Diz ao Supabase para encerrar a sessão no navegador
    navigate("/login2"); // Redireciona o usuário para a página de login imediatamente
    };

    //Identificar a página para mudar o letreiro:
    const local = useLocation().pathname;
        
    // 1. Define os textos com base na rota atual
    let titulo = "Igreja Pedra Angular";
    let subtitulo = "Missão e Reino";

    if (local === '/tesouraria') {
      titulo = "Tesouraria";
      subtitulo = "Igreja Pedra Angular";
    } else if (local === '/secretaria') {
      titulo = "Secretaria";
      subtitulo = "Igreja Pedra Angular";
    }   
    
    const usuarioLogado = !!sessao

    return (
    <header className="bg-black text-white py-4 px-6 border-b-4 border-amber-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Identidade Visual Reduzida */}
        <div className="flex items-center gap-4">
          <img 
            src="/logo.webp" 
            alt="Logo" 
            className="w-12 h-auto" 
          />
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              {titulo}
            </h1>
            
            <p className="text-amber-400 text-[10px] font-bold tracking-widest uppercase -mt-1">
              {subtitulo}
            </p>            
            
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mx-2 sm:mx-0">          
          {/* Se usuarioLogado for true, o botão SAIR aparece */}
          {usuarioLogado && (
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto text-xs font-black border border-red-600 px-2 py-2 rounded text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase"
            >
              Sair
            </button>
          )}

          {/* Se tiver na página de login, volta para o painel e não para a home*/}
          <Link 
            to={destino || "/"} 
            className="w-full sm:w-auto text-xs font-bold border border-amber-500 px-2 py-2 rounded hover:bg-amber-500 hover:text-black transition-all"
          >
            VOLTAR
          </Link>
        </div>
      </div>
    </header>
  );
}

