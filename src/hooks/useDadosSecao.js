import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // Ajuste o caminho se necessário

export const useDadosSessao = () => {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true); // Começa como true

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSessao(session);  
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false); // Desliga o loading após a resposta (sucesso ou falha)
      }
    };
    checkUser();
  }, []);

  // Retorna os dois dados juntos dentro de um objeto
  return { sessao, carregando };
};

