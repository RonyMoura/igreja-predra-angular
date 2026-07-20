// src/servicos/RealtimeService.js
import { supabase } from '../supabaseClient';

/**
 * Cria um canal que escuta múltiplos eventos em várias tabelas.
 * @param {Function} callback - A função que será executada quando QUALQUER mudança ocorrer.
 
export const subscreverMudancasTesouraria = (callback, nomeCanal = 'geral') => {
  const canal = supabase
    .channel(`fluxo-caixa-${nomeCanal}`) // Nome dinâmico!
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tesouraria_ent' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tesouraria_saidas' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tesouraria_transf' }, callback)
    .subscribe();
    
    return canal;
  
};

*/


let canalTesouraria = null;
const listeners = new Set(); // Lista de funções que querem receber os dados

const handleChanges = (payload) => {
  // Quando chega algo, avisamos todo mundo que está na lista
  listeners.forEach((callback) => callback(payload));  
};

export const subscreverGeral = (callback) => {
  listeners.add(callback);

  // Se o canal ainda não existe, criamos agora
  if (!canalTesouraria) {
    canalTesouraria = supabase
      .channel('fluxo-caixa-central')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tesouraria_ent' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tesouraria_saidas' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tesouraria_transf' }, handleChanges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cadastro_membros' }, handleChanges)      
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Conectado ao canal central!');
      });
  }

  // Função para a página se "desinscrever" sem fechar o canal global
  return () => {
    listeners.delete(callback);
    // Opcional: Se listeners.size === 0, você poderia fechar o canalUnico se quiser economizar
  };
};


let canalSecretaria = null;
const listenersSecretaria = new Set();

const handleSecretariaChanges = (payload) => {
  listenersSecretaria.forEach((callback) => callback(payload));  
};

export const subscreverSecretaria = (callback) => {
  listenersSecretaria.add(callback);

  if (!canalSecretaria) {
    canalSecretaria = supabase
      .channel('realtime-secretaria')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cadastro_membros' }, handleSecretariaChanges)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('Conectado ao canal da secretaria!');
      });
  }

  return () => {
    listenersSecretaria.delete(callback);
    if (listenersSecretaria.size === 0 && canalSecretaria) {
      canalSecretaria.unsubscribe();
      canalSecretaria = null;
    }
  };
};
