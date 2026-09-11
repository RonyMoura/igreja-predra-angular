import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Carrossel = () => {
  // Array de dados: Imagem + Link (que você usará no futuro)
  const slides = [
    { id: 3, img: "/encontroComDeus.webp", link: "#" },
    { id: 4, img: "/cultosDomingos.webp", link: "/culto" }, //quando finalizar em /culto, uma mensagem personalizada será exibida ao usuário
    { id: 5, img: "/oracao.webp", link: "#" },
    { id: 6, img: "/celulaJS.webp", link: "/celula_js" },    
    { id: 7, img: "/celulaRC.webp", link: "#" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  //Função para avançar em loop infinito
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  //Função para voltar em loop infinito
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Lógica de troca automática (Auto-play)
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer); 
  }, [nextSlide]);

  {/* Verifica se o link é válido ou se é de uma página de culto programado */}  
  const navigate = useNavigate(); //Necessário para vincular o link, pois foi bloqueado pelo preventDefault
  const handleNavigation = (e, link) => {
    e.preventDefault();
    if (!link || link === "#") {
      alert("Desculpe-nos, página em desenvolvimento.");
    } else if (link.startsWith('/culto')) {
      alert("Venha cultuar conosco, você é nosso convidado!");
    } else {
      navigate(link)
      }
  };

  return (
    <section className="relative w-full overflow-hidden group">
      {/* Container dos Slides */}
      <div 
        className="flex transition-transform duration-700 ease-in-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <Link 
            key={slide.id} 
            to={slide.link} 
            className="min-w-full block"
            onClick={(e) => handleNavigation(e, slide.link)}
          >
            <img 
              src={slide.img} 
              alt={`Slide ${slide.id}`} 
              className="w-full aspect-[10/9] md:aspect-[21/9] object-contain rounded-2xl" 
            />
          </Link> // <--- Aqui estava </a>, agora está corrigido para </Link>
        ))}
      </div>

      {/* Seta Esquerda */}
      <button 
        onClick={prevSlide}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 border border-white/30 shadow-lg"
      >
        <span className="text-xl md:text-2xl font-bold">&#10094;</span>
      </button>

      {/* Seta Direita */}
      <button 
        onClick={nextSlide}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-50 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 border border-white/30 shadow-lg"
      >
        <span className="text-xl md:text-2xl font-bold">&#10095;</span>
      </button>

      {/* Indicadores Visuais (Dots) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${currentIndex === i ? 'bg-white scale-125' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Carrossel;