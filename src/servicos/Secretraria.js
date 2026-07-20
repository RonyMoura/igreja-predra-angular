import { supabase } from "../supabaseClient";


export const salvarMembro = async (dados) =>{
  const {data, error} = await supabase
  .from('cadastro_membros')
  .insert([dados])
  if (error) {
    console.error("Erro ao salvar:", error.message);
  } else {
    console.log("Membro salvo com sucesso!", data);
  }
}