import { useEffect, useRef, useState } from 'react'; // Adicionado useRef
import { Link, useNavigate } from 'react-router-dom';
import PaginasAuxiliares from '../components/PaginasAuxiliares';
import { useDadosSessao } from '../hooks/useDadosSecao';
import { salvarMembro } from '../servicos/Secretraria';
import { subscreverSecretaria } from '../servicos/RealtimeServico';

const Secretaria = () => {
  const [abaAtiva, setAbaAtiva] = useState(null);
  const navigate = useNavigate();
  const sessao = useDadosSessao();
  const dadosUsuario = sessao.sessao; 

  const [enviando, setEnviando] = useState(false); //função para criar um bloqueio no botão de cadastro
  const [formData, setFormData] = useState({
    nome: '',
    data_nasc: '',
    endereco_resid:'',
    bairro:'',
    cidade:'São Paulo',
    cep:'',
    tel1:'',
    tel2:'',
    email:'',
    cargo_ecles:''
  })  
  
  const handleChange = (e) => {
  const { name, value } = e.target;  
    setFormData((dadosAnteriores) => ({
      ...dadosAnteriores, // Mantém o que já estava digitado nos outros campos
      [name]: value       // Atualiza apenas o campo que mudou dinamicamente
    }));
    
  };

  
  // Função para disparar o salvamento:
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar
    
    //Tratamento de dados antes de enviar:
    if (!formData.nome.trim() || !formData.data_nasc) {
      alert("⚠️ Dados incompletos. Verique os campos em vermelho");
      return;
    }  
    
    setEnviando(true);
    
    try {
      // Chama a função importada passando os dados do useState
      await salvarMembro(formData); 
      alert("Membro cadastrado com sucesso!");
      
      // Opcional: Limpar o formulário após salvar
      setFormData({ nome: '', data_nasc: '', endereco_resid:'', bairro:'', cidade:'São Paulo' }); 
      } catch (error) {
        alert("Erro ao salvar: " + error.message);
      } finally {
        // 5. Libera o botão novamente (acontece tanto no sucesso quanto no erro)
        setEnviando(false); 
      }
    };


  // Esta referência impede que o código rode mais de uma vez
  const rodouRedirecionamento = useRef(false);

  let comAcesso;
  try {
    const roles = dadosUsuario?.user?.app_metadata?.role || [];
    comAcesso = roles.some(regra => regra.startsWith('secretario'));
  } catch {
    comAcesso = false;
  }
  
  useEffect(() => {
    // Só executa se o carregamento terminou, não tem acesso E ainda não rodou esta lógica
    if (!sessao?.carregando && !comAcesso && !rodouRedirecionamento.current) {
      rodouRedirecionamento.current = true; // Bloqueia repetições imediatas
      console.log(dadosUsuario);
      alert("Acesso negado: Você não tem permissão de Secretário(a).");
      navigate('/painel');

      }
      
      
    const canalSecretaria = subscreverSecretaria();

  }, [comAcesso, sessao?.carregando, navigate, dadosUsuario, formData]);

  if (!comAcesso) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <p>Verificando autenticação...</p>
      </div>
    );
      
  }

  return (
  <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans antialiased">
    <PaginasAuxiliares sessao={sessao.sessao} />

    <main className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      <div className="w-full flex justify-center mb-6">
        <button 
          onClick={() => setAbaAtiva(abaAtiva === true ? null : true)}
          className={`w-full sm:w-2/3 md:w-1/2 py-3 px-6 font-black uppercase tracking-wider transition-all duration-300 border-2 rounded-full text-sm sm:text-base cursor-pointer shadow-lg ${
            abaAtiva === true 
              ? 'bg-amber-600 border-amber-500 text-white' 
              : 'border-amber-600 text-amber-500 hover:bg-amber-600 hover:text-white'
          }`}
        >
          {abaAtiva === true ? '✕ Fechar' : 'Cadastrar Membro'}
        </button>
      </div>

      {abaAtiva === true && (
        <div className="w-full bg-zinc-900 border border-zinc-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4">
          
          <h3 className="text-xl sm:text-2xl font-black uppercase mb-6 tracking-tight text-amber-500 border-b border-zinc-800 pb-3">
            Novo cadastro
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                
            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Nome Completo</label>
              <input
                className={`w-full bg-black border ${formData.nome === '' ? 'border-red-900' : 'border-emerald-900'} p-3 text-white outline-none transition-colors uppercase rounded-xl text-sm focus:border-amber-500`}
                name="nome" 
                type="text"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome"
              />
            </div>
            
            <div className="col-span-1 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Data de Nascimento</label>
              <input
                className={`w-full bg-black border ${formData.data_nasc === '' ? 'border-red-900' : 'border-emerald-900'} p-3 text-white outline-none transition-colors uppercase rounded-xl text-sm focus:border-amber-500`}
                name="data_nasc" 
                type="date"
                value={formData.data_nasc}
                onClick={(e) => e.target.showPicker()}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Endereço Residencial</label>
              <input
                className={`w-full bg-black border ${formData.endereco_resid === '' ? 'border-red-900' : 'border-emerald-900'} p-3 text-white outline-none transition-colors uppercase rounded-xl text-sm focus:border-amber-500`}
                name="endereco_resid" 
                type="text"
                value={formData.endereco_resid}
                onChange={handleChange}
                placeholder="Rua, Número, Apto"
              />
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Bairro</label>
              <input
                className={`w-full bg-black border ${formData.bairro === '' ? 'border-red-900' : 'border-emerald-900'} p-3 text-white outline-none transition-colors uppercase rounded-xl text-sm focus:border-amber-500`}
                name="bairro" 
                type="text"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Bairro"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Cidade</label>
              <input
                className={`w-full bg-black border ${formData.cidade === '' ? 'border-red-900' : 'border-emerald-900'} p-3 text-white outline-none transition-colors uppercase rounded-xl text-sm focus:border-amber-500`}
                name="cidade" 
                type="text"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Cidade"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400">Celular</label>
              <input
                className={`w-full bg-black border ${formData.tel1 === '' ? 'border-red-900' : 'border-emerald-900'} p-3 text-white outline-none transition-colors uppercase rounded-xl text-sm focus:border-amber-500`}
                name="tel1" 
                type="text"
                value={formData.tel1}
                onChange={handleChange}
                placeholder="(DDD) XXXXX-XXXX"
              />
            </div>


            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-center mt-6">
              <button 
                type="submit"
                disabled={enviando}
                className="w-full sm:w-2/3 md:w-1/2 bg-amber-600 hover:bg-emerald-600 text-white py-3 px-6 font-black uppercase tracking-wider transition-all duration-300 rounded-full text-sm sm:text-base cursor-pointer disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"                      
              >
                {enviando ? 'Processando...' : 'Confirmar Cadastro'}
              </button>
            </div>  
          </form>
        </div>
      )}
    </main>
  </div>
);
};

export default Secretaria;
