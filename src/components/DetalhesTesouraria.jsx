import {Fragment, useEffect, useMemo, useState } from "react";
import { getDadosPorMesAno, atualizarRegistroSupabase } from "../servicos/TesourariaServicos";


export function DetalhesTesouraria() {
 
    const [abaAtiva, setAbaAtiva] = useState('tesouraria_ent');
    const [dados, setDados] = useState ([]);// teremos um array de objetos
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);{/*O mês já iniciado com o atual */}
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    
    //Incluir a função de edição de registros:
    const [edicaoItem, setEdicaoItem] = useState(null);// inicia como falso 


    //Array de meses:
    const lista_meses = [
        { id: 1, nome: 'Jan' },
        { id: 2, nome: 'Fev' },
        { id: 3, nome: 'Mar' },
        { id: 4, nome: 'Abr' },
        { id: 5, nome: 'Mai' },
        { id: 6, nome: 'Jun' },
        { id: 7, nome: 'Jul' },
        { id: 8, nome: 'Ago' },
        { id: 9, nome: 'Set' },
        { id: 10, nome: 'Out' },
        { id: 11, nome: 'Nov' },
        { id: 12, nome: 'Dez' },
    ];    
    

    useEffect(() =>{
        
        async function carregarDados() {
            setLoading(true);
            setDados([]);
            const dados = await getDadosPorMesAno(abaAtiva, mesSelecionado , 2026);            
            setDados(dados);
            setLoading(false);
        }        
            carregarDados()                
         
    }, [mesSelecionado, anoSelecionado, abaAtiva]);//sempre que houver mudanças nessas variáveis, a função irá rodar

    //Somar totais:
    const totais = useMemo(() => {
        if (abaAtiva === 'tesouraria_ent') {
                       
            return dados.reduce((acc, item) => {
                //Se a linha contiver true no desconsiderar, o valor não será somado
                if (item.desconsiderar === true) {
                    acc.pix += 0;
                    acc.especie += 0;
                    acc.totalSaidas += 0;
                    return acc;
                } 
                acc.pix += (Number(item.entrada_pix) || 0);
                acc.especie += (Number(item.entrada_e) || 0);
                acc.totalSaidas += (Number(item.valor) || 0);
                return acc;
            }, { pix: 0, especie: 0 });
        }else if (abaAtiva === 'tesouraria_saidas'){
            return dados.reduce((acc, item) => {

                if (item?.descricao?.includes("*")) {/*a interrogação é para que o código não quebre, caso o retorno seja uma string vazia*/
                    return acc;/*não soma, caso na descrição seja encontrado um sinal de asterisco*/
                }
                acc.totalSaidas += (Number(item.valor) || 0);
                return acc;
            }, { totalSaidas: 0});
        }else{
            return dados.reduce((acc, item) => {
                acc.totalTransf += (Number(item.valor_transf) || 0);
                return acc;
            }, { totalTransf: 0});
        }
    }, [dados, abaAtiva]);//importante para capturar as alterações, é como se fosse um usee
    const totalGeralPeriodo = totais.pix + totais.especie  


        //Função para Editar os dados no Supabase:    
        const handleSalvarEdicao = async (e) => {
            e.preventDefault(); // Impede o formulário de recarregar a página
            
            let dadosParaAtualizar;
            
            if (abaAtiva === "tesouraria_ent") {                        
                dadosParaAtualizar = {
                data: edicaoItem.data,
                entrada_pix: edicaoItem.entrada_pix,
                entrada_e: edicaoItem.entrada_e,
                desconsiderar: edicaoItem.desconsiderar
                };
            } else if (abaAtiva === "tesouraria_saidas") {
                dadosParaAtualizar = {
                data: edicaoItem.data,
                descricao: edicaoItem.descricao,
                origem: edicaoItem.origem || 'conta',
                valor: edicaoItem.valor
                };
            }
            
            // Chama o serviço que criamos, passando o nome da tabela ativa e o ID
            // (Note que usamos 'abaAtiva' como nome da tabela, já que seu código usa ela no getDadosPorMesAno)
            const resultado = await atualizarRegistroSupabase(abaAtiva, edicaoItem.id, dadosParaAtualizar);
            
            
            if (resultado.success) {
                // 4. Se deu certo no banco, atualiza o array de objetos na tela imediatamente
                setDados(dados.map((linhaOriginal) => 
                linhaOriginal.id === edicaoItem.id 
                    ? { ...edicaoItem } 
                    : linhaOriginal
                ));

                // 5. Fecha o formulário resetando para null (simplesmente nada)
                setEdicaoItem(null);
                alert('Registro atualizado com sucesso!');
            } else {
                // Se o serviço retornou falso, avisa o usuário
                alert('Não foi possível salvar as alterações no Supabase.');
            }
        };
    

    return(
        <> 
            <div className="md:max-w-full sm:flex flex-row gap-4 items-center mb-4">
                
                {/* Texto informativo */}
                <p className="text-gray-200 text-sm font-medium whitespace-nowrap sm:mb-0 mb-2">
                    Selecione uma categoria
                </p> 
                <select onChange={(e) => setAbaAtiva(e.target.value)}
                    className="
                        sm:w-48 cursor-pointer 
                        bg-slate-900 
                        text-white 
                        border border-gray-400 
                        rounded-md 
                        px-2 py-2 pr-20
                        text-sm
                        appearance-none
                        focus:ring-2 focus:ring-blue-500/50 
                        transition-all"
                    >               
                    <option value="tesouraria_ent" className="bg-gray-800">Entradas</option>
                    <option value="tesouraria_saidas" className="bg-gray-800">Saídas</option>
                    <option value="tesouraria_transf" className="bg-gray-800">Depósitos</option>
                </select>

                <p className="text-gray-200 text-sm font-medium whitespace-nowrap sm:mb-0 mb-2 sm:mt-0 mt-4 ">Selecione o mês </p>
                <select
                    className="
                        sm:w-48 cursor-pointer 
                        bg-slate-900 
                        text-white 
                        border border-gray-400 
                        rounded-md 
                        px-2 py-2 pr-20
                        text-sm
                        appearance-none
                        focus:ring-2 focus:ring-blue-500/50 
                        transition-all" 
                    value={mesSelecionado} 
                    onChange={(e) => setMesSelecionado(Number(e.target.value))}
                >
                    {lista_meses.map((m) => (
                    <option className="bg-gray-800" key={m.id} value={m.id}>
                        {m.nome}
                    </option>
                    ))}
                </select>
            </div>

            {loading ? <p>Carregando...</p> : ( 

                <>
                    {abaAtiva === 'tesouraria_ent' &&(
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-700 text-gray-300 uppercase text-[10px] sm:text-xs">
                                        <th className="px-2 sm:px-4 py-3 font-semibold whitespace-nowrap">Data</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold text-right">Pix</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold text-right">Espécie</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold text-right">Total</th>
                                    </tr>
                                    </thead>
                                    
                                    <tbody>
                                        {dados.map((item) => (
                                            //Como será necessário retomar o mesmo id em duas linhas, vamos envolver a ambas pelo Fragment, outra biblioteca:
                                            <Fragment key={item.id}>
                                                {/* key={item.id}, como passamos a key para o elemento pai, não é mais necessário está vinculado a tr, que antes era o elemento pai*/}
                                                <tr className="hover:bg-gray-800 border-t border-gray-800 select-none" // o select-none não permite a seleção de componentes na tela
                                                onDoubleClick={() => setEdicaoItem(item)} //Passa o array do item clicado para a variável edicaoItem
                                                >
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200 whitespace-nowrap">                
                                                        {new Date(item.data.replace('-', '/')).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200 text-right">
                                                        R$ {(item.entrada_pix || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200 text-right">
                                                        R$ {(item.entrada_e || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className={`px-2 sm:px-4 py-3 sm:py-4 font-bold text-right ${
                                                        item.desconsiderar ? 'text-amber-600' : 'text-emerald-300'
                                                    }`}>
                                                        R$ {(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </td>                                                                                      
                                                </tr>

                                                {/*Aqui a linha só vai renderizar se contiver informações no banco de dados*/}
                                                {item.observacao && (
                                                    <tr>
                                                        <td
                                                            className="pt-0 pb-2 pl-4 text-gray-400"
                                                            colSpan={4}
                                                        >
                                                            {item.observacao}
                                                        </td>
                                                    </tr>
                                                )}

                                            </Fragment>
                                        ))}                                    
                                    </tbody>
                                </table>
                                
                                <div className="md:max-w-full sm:flex flex-row gap-4 items-center sm:justify-center">
                                    <p><strong>Total pix: {totais.pix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                                    <p><strong>Total espécie: {totais.especie.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                                    <p><strong>Acumulado mês: {totalGeralPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>                                    
                                </div>
                                
                            </div>
                        </>
                        
                    )}

                    {abaAtiva === 'tesouraria_saidas' &&(
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-700 text-gray-300 uppercase text-[10px] sm:text-xs">
                                        <th className="px-2 sm:px-4 py-3 font-semibold whitespace-nowrap">Data</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold">Descrição</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold">Valor</th>
                                    </tr>
                                    </thead>
                                    
                                    <tbody className="divide-y divide-gray-800">
                                    
                                    {dados.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-800 transition-colors select-none"
                                            onDoubleClick={() => setEdicaoItem(item)}
                                        >
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200 whitespace-nowrap">                
                                            {new Date(item.data.replace('-', '/')).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200">
                                            {item.descricao}
                                        </td>
                                        <td className={`px-2 sm:px-4 py-3 sm:py-4 font-bold text-right"
                                            ${
                                                item?.descricao?.includes("*") ? 'text-amber-600' : 'text-red-500'
                                            }`}>
                                            R$ {(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                             
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="md:max-w-full sm:flex flex-row gap-4 items-center sm:justify-center">
                                    <p><strong>Total de despesas: {totais.totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>                                    
                                </div>
                            </div>
                        </>
                    )}

                    {abaAtiva === 'tesouraria_transf' &&(
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs md:text-sm">
                                    <thead>
                                    <tr className="border-b border-gray-700 text-gray-300 uppercase text-[10px] sm:text-xs">
                                        <th className="px-2 sm:px-4 py-3 font-semibold whitespace-nowrap">Data</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold">Valor</th>
                                        <th className="px-2 sm:px-4 py-3 font-semibold">Observação</th>
                                    </tr>
                                    </thead>
                                    
                                    <tbody className="divide-y divide-gray-800">
                                    {dados.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-800 transition-colors">
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200 whitespace-nowrap">                
                                            {new Date(item.data.replace('-', '/')).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: '2-digit'
                                            })}
                                        </td>                                        
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 font-bold text-right text-amber-500">
                                            R$ {(item.valor_transf || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-200">
                                            {item.observacao}
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="md:max-w-full sm:flex flex-row gap-4 items-center sm:justify-center">
                                    <p><strong>Total de depósitos: {totais.totalTransf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>                                    
                                </div>
                            </div>
                        </>
                        
                    )}

                    {/*Formulário para editar itens de entrada: */}    
                    {edicaoItem && abaAtiva === "tesouraria_ent" && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
                            
                            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full text-white shadow-xl">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-blue-400">Editar Registro #{edicaoItem.id}</h3>
                                <span className="text-xs text-gray-400">Criado em: {new Date(edicaoItem.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Formulário local */}
                            <form className="flex flex-col gap-4" onSubmit={handleSalvarEdicao}>
                                
                                {/* Campo Data */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Data do Registro:</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                                    value={edicaoItem.data || ''}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, data: e.target.value })}
                                />
                                </div>

                                {/* Campo Entrada PIX */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Entrada PIX (R$):</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                                    value={edicaoItem.entrada_pix ?? 0}
                                    // Convertemos para número com Number() para manter a tipagem correta do banco
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, entrada_pix: Number(e.target.value) })}
                                />
                                </div>

                                {/* Campo Entrada Espécie (entrada_e) */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Entrada Espécie (R$):</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                                    value={edicaoItem.entrada_e ?? 0}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, entrada_e: Number(e.target.value) })}
                                />
                                </div>

                                {/* Campo Observação */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Observação:</label>
                                <textarea 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none h-20 resize-none"
                                    value={edicaoItem.observacao || ''}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, observacao: e.target.value })}
                                    placeholder="Nenhuma observação informada..."
                                />
                                </div>

                                {/* Opção Desconsiderar (Checkbox) */}
                                <div className="flex items-center gap-2 my-2">
                                <input 
                                    type="checkbox" 
                                    id="desconsiderar"
                                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-600 focus:ring-0 cursor-pointer"
                                    checked={edicaoItem.desconsiderar || false}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, desconsiderar: e.target.checked })}
                                />
                                <label htmlFor="desconsiderar" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                                    Desconsiderar este registro no relatório
                                </label>
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex justify-end gap-3 mt-4 border-t border-gray-700 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setEdicaoItem(null)} // Limpa o estado e fecha o formulário
                                    className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" //considerar o botão como submit para atualizar os dados
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm font-medium transition-colors"
                                >
                                    Atualizar dados
                                </button>
                                </div>

                            </form>
                            </div>
                        </div>
                    )}

                    {/*Formulário para editar itens de saída: */}
                    {edicaoItem && abaAtiva === "tesouraria_saidas" && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
                            
                            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 max-w-md w-full text-white shadow-xl">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-red-400">Editar Saída #{edicaoItem.id}</h3>
                                <span className="text-xs text-gray-400">Criado em: {new Date(edicaoItem.created_at).toLocaleDateString()}</span>
                            </div>

                            <form className="flex flex-col gap-4" onSubmit={handleSalvarEdicao}>
                                
                                {/* Campo Data */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Data da Saída:</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-red-500 focus:outline-none"
                                    value={edicaoItem.data || ''}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, data: e.target.value })}
                                    required
                                />
                                </div>

                                {/* Campo Descrição */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Descrição / Destino:</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-red-500 focus:outline-none"
                                    placeholder="Ex: Pagamento de fornecedor, energia, etc."
                                    value={edicaoItem.descricao || ''}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, descricao: e.target.value })}
                                    required
                                />
                                </div>

                                {/* Campo Origem (Select) */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Origem do Recurso:</label>
                                <select 
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-red-500 focus:outline-none cursor-pointer"
                                    value={edicaoItem.origem || 'conta'}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, origem: e.target.value })} // Ajuste o nome da propriedade se no banco for 'origem' ou 'origen'
                                >
                                    <option value="conta">Conta Bancária</option>
                                    <option value="especie">Saldo em Espécie</option>
                                </select>
                                </div>

                                {/* Campo Valor */}
                                <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Valor da Saída (R$):</label>
                                <input 
                                    type="number" 
                                    step="0.01" // Permite números decimais (centavos)
                                    className="w-full p-2.5 rounded bg-gray-800 border border-gray-600 text-white focus:border-red-500 focus:outline-none"
                                    value={edicaoItem.valor ?? 0}
                                    onChange={(e) => setEdicaoItem({ ...edicaoItem, valor: Number(e.target.value) })}
                                    required
                                />
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex justify-end gap-3 mt-4 border-t border-gray-700 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setEdicaoItem(null)} // Limpa o estado e fecha o formulário
                                    className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-600 rounded hover:bg-gray-700 text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 text-sm font-medium transition-colors"
                                >
                                    Alterar registro
                                </button>
                                </div>

                            </form>
                            </div>
                        </div>
                    )}    
                </>
            )}        
        </>    
    )
}