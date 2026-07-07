import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { subscreverGeral } from '../servicos/RealtimeServico'

export default function useSaldos() {
  const [saldos, setSaldos] = useState({ subpix: 0, subEspecie: 0, total: 0 })

  // 1. Função que calcula os saldos (Reutilizável)
  const calcularSaldos = async () => {
    //buscar os dados na tabela de entradas:
    const { data, error } = await supabase
      .from('tesouraria_ent')
      .select('entrada_pix, entrada_e, valor_total')
    //buscar os dados na tabela de saídas:
    const {data: dados, error: error2} = await supabase
      .from('tesouraria_saidas')
      .select('valor, origem')
    //buscar os dados na tabela de transferências:
    const {data: dados_t, error: error_t} = await supabase
      .from('tesouraria_transf')
      .select('origem, destino, valor_transf') 
      // Filtra apenas o que interessa (evita trazer lixo)
      .or('origem.in.(especie,conta),destino.in.(especie,conta)');
        
    if (!error && data && !error2 && dados && !error_t && dados_t) {
      const pix = data
      .reduce((acc, item) => acc + Number(item.entrada_pix), 3875.03)

      const especie = data
      .reduce((acc, item) => acc + Number(item.entrada_e), 0)
      
      const saidaConta = dados
      .filter(item => item.origem === 'conta')
      .reduce((acc, item) => acc + Number(item.valor), 0)
    
      const saidaEspecie = dados
      .filter(item => item.origem === 'especie')
      .reduce((acc, item) => acc + Number(item.valor), 0)

      let somaEspecieParaConta = 0;
      let somaContaParaEspecie = 0;

      if (dados_t) {
        // Soma 1: Especie -> Conta
        somaEspecieParaConta = dados_t
          .filter(item => item.origem === 'especie' && item.destino === 'conta')
          .reduce((acc, item) => acc + item.valor_transf, 0);

        // Soma 2: Conta -> Especie
        somaContaParaEspecie = dados_t
          .filter(item => item.origem === 'conta' && item.destino === 'especie')
          .reduce((acc, item) => acc + item.valor_transf, 0);
      }
      
      let subpix = 0; 
      let subEspecie = 0; 

      // 1. Cálculo base (Entradas - Saídas normais)
      // Imaginando que 'pix' e 'especie' são seus saldos iniciais/entradas
      subpix = pix - saidaConta;
      subEspecie = especie - saidaEspecie;

      // 2. Ajuste pelas transferências entre eles
      // O que foi de Espécie para Conta: Sai da espécie (-), entra no pix (+)
      subpix += somaEspecieParaConta;
      subEspecie -= somaEspecieParaConta;

      // O que foi de Conta para Espécie: Sai do pix (-), entra na espécie (+)
      subpix -= somaContaParaEspecie;
      subEspecie += somaContaParaEspecie;

        
      setSaldos({ subpix, subEspecie, total: subpix + subEspecie })
    }
    }

      useEffect(() => {

        calcularSaldos();

      
        //const desinscrever = subscreverGeral((payload) => {
        const desinscrever = subscreverGeral(() => {  
          
          calcularSaldos();
        
          /*//FUNÇÃO PARA FILTRAR O TIPO DE EVENTO A SER CONSIDERADO:
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            calcularSaldos();
          }
          */
        });

      return () => desinscrever(); // Remove a função da lista ao sair da página
    }, []);

  return saldos;

  }


  

