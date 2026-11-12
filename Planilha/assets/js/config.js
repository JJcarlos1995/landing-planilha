/* ==========================================================================
   01 FINANÇAS — Configuração do site
   Edite este arquivo antes de publicar. Nenhum outro arquivo precisa mudar
   para conectar os checkouts, ajustar preços, prazo ou e-mail de suporte.
   ========================================================================== */

window.SITE_CONFIG = {
  brand: '01 Finanças',
  siteUrl: 'https://01financas.com.br',

  /**
   * Preços em reais. Aparecem nos cards, no CTA final e na barra mobile.
   * Mantenha os mesmos valores configurados no checkout.
   */
  prices: {
    basica: 4.99,
    dinamica: 9.99,
    completa: 15.99,
  },

  /**
   * Links diretos de checkout de cada plano.
   * Cole a URL completa (https://...) gerada na sua plataforma de pagamento.
   * Enquanto estiver vazio, os botões mostram um aviso em vez de abrir um
   * link quebrado. Ex.: 'https://pay.kiwify.com.br/abc123'
   */
  checkout: {
    basica: '',
    dinamica: '',
    completa: '',
  },

  /**
   * Contagem regressiva honesta: use uma data real e não reinicie o prazo
   * sem uma nova campanha. Depois do prazo, o contador é escondido.
   * Formato ISO 8601 com fuso. Para desativar, use enabled: false.
   */
  launch: {
    enabled: true,
    endsAt: '2026-11-30T23:59:59-03:00',
  },

  /**
   * Notificações de compras da planilha (canto inferior).
   * Edite `items` com nome, cidade, versão ('Completa', 'Dinâmica' ou 'Básica')
   * e tempo (`time` ou `minutesAgo`).
   */
  socialProof: {
    enabled: true,
    items: [
      { name: 'Marina S.', city: 'São Paulo, SP', plan: '01 Completa', minutesAgo: 2 },
      { name: 'Rafael M.', city: 'Curitiba, PR', plan: '01 Completa', minutesAgo: 6 },
      { name: 'Camila T.', city: 'Belo Horizonte, MG', plan: '01 Dinâmica', minutesAgo: 11 },
      { name: 'Lucas A.', city: 'Porto Alegre, RS', plan: '01 Completa', minutesAgo: 18 },
      { name: 'Fernanda R.', city: 'Brasília, DF', plan: '01 Básica', minutesAgo: 24 },
      { name: 'Bruno C.', city: 'Florianópolis, SC', plan: '01 Completa', minutesAgo: 31 },
      { name: 'Juliana P.', city: 'Recife, PE', plan: '01 Dinâmica', minutesAgo: 42 },
      { name: 'Thiago L.', city: 'Campinas, SP', plan: '01 Completa', minutesAgo: 53 },
    ],
    startDelay: 2200,
    interval: 9500,
    displayDuration: 5500,
    maxPerSession: 12,
  },

  supportEmail: 'contato@01financas.com.br',
};
