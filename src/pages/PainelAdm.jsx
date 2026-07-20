import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function PainelAdmin() {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  // Monitora se o usuário está logado apenas para trocar o texto do botão de Sair/Login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUsuarioLogado(!!session);
    };
    checkUser();
  }, []);

  // Função mestre para proteger os botões
  const acessarAreaRestrita = async (rota) => {
    const { data: { session } } = await supabase.auth.getSession();
      if (rota === '/montar') {
        alert('Funcionalidades a serem adicionadas')
      } else{
        if (session) {
          navigate(rota); // Se estiver logado, vai para a página
        } else {
          // Se não estiver logado, manda para o login e avisa (opcional)
          navigate(`/login2?redirect=${encodeURIComponent(rota)}`); 
        }
      }  
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuarioLogado(false);
    navigate("/"); // Volta para a home ao sair
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header fixo com sua identidade visual */}
      <header className="bg-black border-b-4 border-amber-500 p-6 flex justify-between items-center shadow-2xl">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Painel Administrativo</h1>
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em]">Igreja Pedra Angular</p>
        </div>
        
        {usuarioLogado && (
          <button 
            onClick={handleLogout}
            className="text-[10px] font-black border border-red-600 px-4 py-2 rounded text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase"
          >
            Encerrar Sessão
          </button>
        )}
      </header>

      <main className="container mx-auto p-8 max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="text-zinc-500 font-bold uppercase text-sm tracking-widest">Selecione uma ferramenta</h2>
          <div className="h-1 w-20 bg-amber-500 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Botão: Adicionar Culto (PROTEGIDO) */}
          <button 
            onClick={() => acessarAreaRestrita("/formulario_cultos")} 
            className="group bg-zinc-900 border-2 border-zinc-800 p-8 rounded-xl hover:border-amber-500 transition-all text-left shadow-lg relative overflow-hidden"
          >
            <div className="bg-amber-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <span className="text-black font-black text-2xl">+</span>
            </div>
            <h2 className="text-xl font-bold uppercase mb-2 group-hover:text-amber-400 transition-colors">Adicionar Culto</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">Acesse o formulário de cadastro de celebrações e eventos.</p>
            <span className="absolute top-4 right-4 text-[10px] text-zinc-600 font-bold uppercase border border-zinc-800 px-2 py-1 rounded">Restrito</span>
          </button>

          {/* Botão: Tesouraria (PROTEGIDO) */}
          <button 
            onClick={() => acessarAreaRestrita("/tesouraria")}
            className="group bg-zinc-900 border-2 border-zinc-800 p-8 rounded-xl hover:border-amber-500 transition-all text-left shadow-lg relative overflow-hidden"
          >
            <div className="bg-amber-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <span className="text-black font-black text-2xl">$</span>
            </div>
              <span className="absolute top-4 right-4 text-[10px] text-zinc-600 font-bold uppercase border border-zinc-800 px-2 py-1 rounded">Restrito</span>
            <h2 className="text-xl font-bold uppercase mb-2 group-hover:text-amber-400 transition-colors">Tesouraria</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">Gestão financeira, dízimos e ofertas.</p>
          </button>

          {/* Botão: Secretaria (PROTEGIDO) */}
          <button 
            onClick={() => acessarAreaRestrita("/secretaria")}
            className="group bg-zinc-900 border-2 border-zinc-800 p-8 rounded-xl hover:border-amber-500 transition-all text-left shadow-lg relative overflow-hidden"
          >
            <div className="bg-amber-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <span className="text-black font-black text-2xl">S</span>
            </div>
              <span className="absolute top-4 right-4 text-[10px] text-zinc-600 font-bold uppercase border border-zinc-800 px-2 py-1 rounded">Restrito</span>
            <h2 className="text-xl font-bold uppercase mb-2 group-hover:text-amber-400 transition-colors">Secretaria</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">Gestão da membreseia: carteirinhas, cadastros de membros, atas de reuniões...</p>
          </button>

          {/* Botão: Próxima ferramente - Desativado, pois não haverá a inclusão de mais ferramentas.
            <button 
              onClick={() => acessarAreaRestrita("/montar")}
              className="group bg-zinc-900/50 border-2 border-zinc-800/50 p-8 rounded-xl text-left shadow-lg opacity-60 cursor-help"
            >
              <div className="bg-zinc-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-zinc-500">
                <span className="font-black text-xl">?</span>
              </div>
              <h2 className="text-xl font-bold uppercase mb-2">Próxima ferramenta</h2>
              <p className="text-zinc-500 text-sm">Funcionalidades que serão inseridas futuramente (Bloqueado).</p>
            </button>
          */}  

        </div>

        {/* Botão de Voltar para o Site Público */}
        <div className="mt-12 text-center">
            <button 
                onClick={() => navigate("/")}
                className="text-zinc-400 border border-amber-600 px-2 py-2 rounded hover:bg-amber-500 hover:border-amber-500 hover:text-black text-xs font-bold uppercase tracking-widest transition-all"
            >
                Tela inicial
            </button>
        </div>
      </main>
    </div>
  );
}
