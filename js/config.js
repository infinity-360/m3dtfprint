/* =========================================================
   M3 DTF PRINT — configurações gerais do site
   Altere aqui telefone, preços e larguras de impressão.
   ========================================================= */
window.M3 = {
  nome: 'M3 DTF PRINT',
  whatsapp: '5543991262269',            // só números, com DDI 55
  whatsappExibicao: '(43) 99126-2269',
  instagram: 'https://www.instagram.com/m3.dtf/',
  shopee: 'https://shopee.com.br/m3printdtf',
  shopeeId: '1039679771',
  endereco: 'Av. Cristiano Kussmaul, 242 — Apucarana/PR',

  /* Tipos de impressão do montador.
     largura e alturaFolha em cm. precoMetro em R$ por metro linear.
     O valor é cobrado pelo comprimento usado, arredondado para cima
     em múltiplos de "arredondarCm", respeitando o "minimoCm". */
  impressoes: {
    textil: {
      nome: 'DTF Têxtil',
      descricao: 'Para camisetas, bonés, moletons, uniformes e qualquer tecido.',
      largura: 57,
      alturaFolha: 100,
      precoMetro: 59.99,
      minimoCm: 100,
      arredondarCm: 10
    },
    uv: {
      nome: 'DTF UV (adesivo)',
      descricao: 'Para copos, canecas, vidros, acrílicos, metais e superfícies rígidas.',
      largura: 28,
      alturaFolha: 100,
      precoMetro: 79.90,
      minimoCm: 100,
      arredondarCm: 10
    }
  },

  espacamentoCm: 0.5,   // distância padrão entre as estampas
  margemCm: 0.5,        // margem nas bordas da folha
  dpi: 300              // resolução do PNG final
};
