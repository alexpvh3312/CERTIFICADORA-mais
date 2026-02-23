import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import { PricingPlan, LeadRecord } from './types';

// Configurações iniciais padrão
const DEFAULT_CONFIG = {
  whatsappNumber: "5569993879543",
  pixKey: "36.863.516/0001-07",
  pixBeneficiary: "ALEXSANDRO PINTO DA SILVA",
  pixInstitution: "PAGSEGURO INTERNET IP S.A.",
  carouselImages: [
    {
      url: "ANIMATED_BRAND",
      title: "APSILVA CERTIFICADORA",
      desc: "Sua Identidade Digital com Segurança e Agilidade"
    },
    {
      url: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=2070&auto=format&fit=crop",
      title: "Emissão por Videoconferência",
      desc: "Valide seu certificado sem sair de casa, em poucos minutos via celular."
    },
    {
      url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
      title: "Assinatura Digital com Validade Jurídica",
      desc: "Assine documentos eletrônicos com a mesma validade da assinatura de punho."
    },
    {
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
      title: "Segurança e Criptografia",
      desc: "Proteção total para suas transações eletrônicas e identidade digital."
    },
    {
      url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
      title: "Tecnologia de Ponta",
      desc: "Inovação constante para garantir a melhor experiência em certificação digital."
    }
  ],
  plans: [
    {
      id: 'a1-cpf',
      name: 'e-CPF A1 (Digital)',
      price: 'R$ 190,00',
      features: ['Validade de 1 ano', 'Instalação no computador', 'Uso ilimitado', 'Emissão em 15min'],
      popular: false
    },
    {
      id: 'a1-cnpj',
      name: 'e-CNPJ A1 (Digital)',
      price: 'R$ 219,00',
      features: ['Validade de 1 ano', 'Para empresas (PJ)', 'Emissão via WhatsApp', 'Suporte VIP'],
      popular: true
    },
    {
      id: 'a3-cpf',
      name: 'e-CPF A3 (Token/Nuvem)',
      price: 'R$ 289,00',
      features: ['Validade de 3 anos', 'Nuvem ou Token USB', 'Máxima segurança', 'Renovação Simplificada'],
      popular: false
    }
  ],
  heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-circuit-board-1610-large.mp4",
  heroVideoOpacity: 0.4
};

const testimonials = [
  {
    name: "Ricardo M.",
    role: "Contador",
    text: "Processo extremamente rápido e seguro. Recomendo a APSILVA para todos os meus clientes.",
    avatar: "https://picsum.photos/seed/ricardo/100/100"
  },
  {
    name: "Juliana S.",
    role: "Empresária",
    text: "A vídeo conferência foi super tranquila. Em 10 minutos meu certificado estava pronto.",
    avatar: "https://picsum.photos/seed/juliana/100/100"
  },
  {
    name: "Marcos P.",
    role: "Advogado",
    text: "Melhor custo-benefício que encontrei. O suporte via WhatsApp é nota 10.",
    avatar: "https://picsum.photos/seed/marcos/100/100"
  },
  {
    name: "Ana L.",
    role: "Profissional Liberal",
    text: "Fiz a renovação do meu e-CPF sem sair de casa. Praticidade total!",
    avatar: "https://picsum.photos/seed/ana/100/100"
  }
];

const faqs = [
  { q: "Quais documentos preciso para emitir?", a: "Para CPF: RG ou CNH original. Para CNPJ: Contrato Social e documento dos sócios. Tudo enviado via foto no WhatsApp." },
  { q: "A videoconferência é obrigatória?", a: "Sim, é uma norma de segurança do ITI. Mas fique tranquilo, nossa equipe faz tudo em menos de 5 minutos via celular." },
  { q: "Em quanto tempo recebo o certificado?", a: "Após a aprovação da videoconferência, o link de download é enviado instantaneamente pelo WhatsApp." }
];

const Label = ({ children }: React.PropsWithChildren<{}>) => (
  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1 block">
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props} 
    className={`w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all ${props.className || ''}`}
  />
);

const App: React.FC = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [adminTab, setAdminTab] = useState<'config' | 'database'>('config');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [funnelStep, setFunnelStep] = useState<'landing' | 'lead' | 'upsell' | 'payment' | 'success'>('landing');
  const [leadData, setLeadData] = useState({ 
    name: '', doc: '', whatsapp: '', email: '',
    cep: '', logradouro: '', numeroCasa: '', bairro: '', cidade: '', estado: '', birthDate: ''
  });
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixDetails, setShowPixDetails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    const savedConfig = localStorage.getItem('apsilva_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Fallback para manter compatibilidade se o carrossel não estiver no salvo
      if (!parsed.carouselImages) parsed.carouselImages = DEFAULT_CONFIG.carouselImages;
      if (!parsed.heroVideoUrl) parsed.heroVideoUrl = DEFAULT_CONFIG.heroVideoUrl;
      if (parsed.heroVideoOpacity === undefined) parsed.heroVideoOpacity = DEFAULT_CONFIG.heroVideoOpacity;
      setConfig(parsed);
    }
    
    const savedLeads = localStorage.getItem('apsilva_leads');
    if (savedLeads) setLeads(JSON.parse(savedLeads));
  }, []);

  // Timer do Carrossel
  useEffect(() => {
    if (config.carouselImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % config.carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [config.carouselImages]);

  const saveConfig = () => {
    localStorage.setItem('apsilva_config', JSON.stringify(config));
    alert("Configurações salvas!");
    setIsAdminOpen(false);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass === '3312') setIsAuthorized(true);
    else alert("Senha incorreta!");
  };

  useEffect(() => {
    const cepDigits = leadData.cep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      setIsFetchingCep(true);
      fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setLeadData(prev => ({
              ...prev, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf
            }));
          }
        })
        .finally(() => setIsFetchingCep(false));
    }
  }, [leadData.cep]);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: LeadRecord = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('pt-BR'),
      planName: selectedPlan?.name || 'Não especificado'
    };
    
    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    localStorage.setItem('apsilva_leads', JSON.stringify(updatedLeads));
    
    setFunnelStep('payment');
  };

  const deleteLead = (id: string) => {
    if (window.confirm("Deseja realmente excluir este registro?")) {
      const updated = leads.filter(l => l.id !== id);
      setLeads(updated);
      localStorage.setItem('apsilva_leads', JSON.stringify(updated));
    }
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setFunnelStep('success');
    }, 2000);
  };

  const finalizeSale = () => {
    const msg = `*NOVO PEDIDO - APSILVA CERTIFICADORA*
------------------------------------------
*PLANO:* ${selectedPlan?.name}

*DADOS DO CLIENTE:*
*Nome:* ${leadData.name}
*Documento:* ${leadData.doc}
*Nascimento:* ${leadData.birthDate}
*E-mail:* ${leadData.email}
*WhatsApp:* ${leadData.whatsapp}

*ENDEREÇO:*
*CEP:* ${leadData.cep}
*Logradouro:* ${leadData.logradouro}, ${leadData.numeroCasa}
*Bairro:* ${leadData.bairro}
*Cidade/UF:* ${leadData.cidade} - ${leadData.estado}
------------------------------------------
_Aguardando agendamento da videoconferência._`;

    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert("Copiado!"));
  };

  const downloadLeadsCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Data/Hora", "Plano", "Nome", "Documento", "WhatsApp", "Email", "CEP", "Logradouro", "Número", "Bairro", "Cidade", "Estado", "Nascimento"];
    const rows = leads.map(l => [l.id, l.timestamp, l.planName, l.name, l.doc, l.whatsapp, l.email, l.cep, l.logradouro, l.numeroCasa, l.bairro, l.cidade, l.estado, l.birthDate].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `apsilva_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const downloadLeadsPDF = async () => {
    if (leads.length === 0) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF('l', 'mm', 'a4');
      const dateStr = new Date().toLocaleString('pt-BR');
      doc.setFontSize(20);
      doc.setTextColor(7, 94, 84);
      doc.text('APSILVA CERTIFICADORA', 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('Relatório de Base de Dados de Clientes', 14, 28);
      const tableColumn = ["Data/Hora", "Plano", "Nome Cliente", "CPF/CNPJ", "WhatsApp", "Endereço Completo", "E-mail"];
      const tableRows = leads.map(l => [
        l.timestamp, 
        l.planName, 
        l.name, 
        l.doc, 
        l.whatsapp, 
        `${l.logradouro}, ${l.numeroCasa} - ${l.bairro}, ${l.cidade}/${l.estado}`, 
        l.email
      ]);
      autoTable(doc, {
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [7, 94, 84] }
      });
      doc.save(`apsilva_leads_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      alert("Erro ao gerar PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImgs = [...config.carouselImages];
        newImgs[index].url = base64String;
        setConfig({ ...config, carouselImages: newImgs });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setConfig({ ...config, heroVideoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const addCarouselImage = () => {
    setConfig({
      ...config,
      carouselImages: [...config.carouselImages, { url: "", title: "", desc: "" }]
    });
  };

  const removeCarouselImage = (index: number) => {
    const newImages = [...config.carouselImages];
    newImages.splice(index, 1);
    setConfig({ ...config, carouselImages: newImages });
  };

  // Função para formatar data (DD/MM/AAAA)
  const formatBirthDate = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 8);
    if (v.length >= 5) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
  };

  const formatDoc = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length <= 11) {
      return v
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
        .slice(0, 14);
    } else {
      return v
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
        .slice(0, 18);
    }
  };

  const formatCEP = (value: string) => {
    return value.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 11);
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return v.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 text-center relative overflow-hidden min-h-[80vh] flex items-center justify-center">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 grayscale brightness-50"
          style={{ opacity: config.heroVideoOpacity }}
          key={config.heroVideoUrl}
        >
          <source src={config.heroVideoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-[1]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50 pointer-events-none z-[2]"></div>
        
        <div className="max-w-5xl mx-auto animate-fade-in space-y-10 relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] overflow-hidden">
                  <img src={`https://picsum.photos/seed/hero${i}/50/50`} alt="User" />
                </div>
              ))}
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="text-emerald-500">+5 mil</span> clientes satisfeitos
            </span>
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-[-0.04em] uppercase">
            Certificado <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700">Digital</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            A APSILVA une tecnologia e agilidade. Tenha seu e-CPF ou e-CNPJ validado em minutos através de videoconferência.
          </p>
          <div className="pt-6">
            <a href="#precos" className="bg-emerald-600 text-white px-12 py-6 rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 hover:bg-emerald-500 transition-all inline-block uppercase tracking-tighter">
              Escolher meu Certificado
            </a>
          </div>
        </div>
      </section>

      {/* Bento Grid Differentials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Big Card */}
            <div className="md:col-span-2 md:row-span-2 bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 flex flex-col justify-between group hover:border-emerald-500/30 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-all"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-4xl font-black text-white leading-none tracking-tighter uppercase mb-4">Videoconferência <br/> Instantânea</h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">Valide seu certificado sem sair de casa, em poucos minutos via celular com nossa equipe especializada.</p>
              </div>
              <div className="mt-12 relative z-10">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0a0a0a] bg-slate-800 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-4 border-[#0a0a0a] bg-emerald-500 flex items-center justify-center text-xs font-black">+5k</div>
                </div>
                <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest">Mais de 5.000 emissões realizadas este mês</p>
              </div>
            </div>

            {/* Medium Card 1 */}
            <div className="md:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 group hover:border-emerald-500/30 transition-all relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Segurança Máxima</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Criptografia de ponta a ponta seguindo rigorosamente as normas do ITI Brasil.</p>
                </div>
                <div className="w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl absolute -right-10 -top-10"></div>
              </div>
            </div>

            {/* Small Card 1 */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 group hover:border-emerald-500/30 transition-all">
              <div className="space-y-4">
                <h4 className="text-emerald-500 font-black text-4xl tracking-tighter">15min</h4>
                <p className="text-white font-bold uppercase text-xs tracking-widest">Tempo médio de emissão</p>
              </div>
            </div>

            {/* Small Card 2 */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 group hover:border-emerald-500/30 transition-all">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <svg key={i} className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-white font-bold uppercase text-xs tracking-widest">Avaliação 5 estrelas no Google</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrossel Principal */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[300px] sm:h-[500px] rounded-[40px] overflow-hidden shadow-2xl bg-slate-900 border-8 border-white">
            {config.carouselImages.length > 0 ? config.carouselImages.map((img, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"></div>
                {img.url === "ANIMATED_BRAND" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
                    {/* Background effects */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    
                    {/* Animated Content */}
                    <div className="relative z-20 flex flex-col items-center">
                      <div className="mb-6 relative">
                        <div className="w-24 h-24 border-4 border-emerald-500 rounded-2xl flex items-center justify-center animate-float">
                          <div className="w-12 h-12 bg-emerald-500 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="absolute -inset-4 border border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                      </div>
                      
                      <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter text-center px-4">
                        <span className="inline-block animate-fade-in" style={{ animationDelay: '0.2s' }}>APSILVA</span>
                        <br />
                        <span className="text-emerald-500 inline-block animate-fade-in" style={{ animationDelay: '0.5s' }}>CERTIFICADORA</span>
                      </h2>
                      
                      <div className="mt-8 h-1 w-32 bg-emerald-500/30 rounded-full overflow-hidden relative">
                        <div className="h-full bg-emerald-500 w-full -translate-x-full animate-[slide-right_2s_ease-in-out_infinite]"></div>
                      </div>
                    </div>
                    
                    {/* Scan line */}
                    <div className="absolute inset-x-0 pointer-events-none z-30">
                      <div className="w-full h-[2px] bg-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.8)] absolute animate-[scan_4s_linear_infinite]"></div>
                    </div>
                  </div>
                ) : (
                  <img src={img.url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"} className="w-full h-full object-cover" alt={img.title} />
                )}
                <div className="absolute bottom-10 left-10 z-20 text-white animate-slide-up">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{img.title}</h3>
                  <p className="text-emerald-400 font-bold">{img.desc}</p>
                </div>
              </div>
            )) : (
              <div className="absolute inset-0 flex items-center justify-center text-white font-black uppercase opacity-20">Nenhuma imagem configurada</div>
            )}
            
            {/* Controles do Carrossel */}
            {config.carouselImages.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-4 z-30 flex items-center">
                  <button onClick={() => setCurrentSlide(prev => (prev - 1 + config.carouselImages.length) % config.carouselImages.length)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div className="absolute inset-y-0 right-4 z-30 flex items-center">
                  <button onClick={() => setCurrentSlide(prev => (prev + 1) % config.carouselImages.length)} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                  {config.carouselImages.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlide(i)}
                      className={`w-12 h-1 rounded-full transition-all ${currentSlide === i ? 'bg-emerald-500' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Preços Dinâmicos */}
      <section id="precos" className="py-32 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-none">Planos e Valores</h2>
            <p className="text-slate-500 font-medium mt-4">Os melhores preços com emissão garantida.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {config.plans.map((plan) => (
              <div key={plan.id} className={`group relative bg-[#0f0f0f] p-10 rounded-[40px] border transition-all duration-500 ${plan.popular ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.15)] scale-105 z-10' : 'border-white/5 hover:border-white/10'}`}>
                {plan.popular && <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Mais Vendido</span>}
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter text-white">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                </div>
                <ul className="space-y-4 mb-12">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400 font-medium text-sm">
                      <div className="w-5 h-5 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { setSelectedPlan(plan); setFunnelStep('lead'); }} className={`w-full py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-tighter ${plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20' : 'bg-white text-black hover:bg-slate-200'}`}>
                  CONTRATAR AGORA
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Depoimentos */}
      <section className="py-32 px-4 bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
            <div className="max-w-2xl">
              <h2 className="text-5xl sm:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-6">
                Quem usa,<br/><span className="text-emerald-500">recomenda.</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg">Milhares de clientes satisfeitos em todo o Brasil.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#050505] overflow-hidden bg-slate-800">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-black text-xl leading-none tracking-tighter">+5.000</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Clientes Ativos</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className={`p-8 rounded-[40px] border border-white/5 bg-[#0a0a0a] flex flex-col justify-between transition-all hover:border-emerald-500/30 group ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                  </div>
                  <p className={`text-white font-medium leading-relaxed tracking-tight ${i === 0 ? 'text-2xl' : 'text-lg'}`}>
                    "{t.text}"
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-12">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-tighter text-sm">{t.name}</h4>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-4 bg-[#050505]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-8 text-left font-black text-white uppercase tracking-tighter text-lg">
                  {faq.q}
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform ${openFaq === idx ? 'rotate-180 bg-emerald-500/20 text-emerald-500' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-8 pb-8 text-slate-400 font-medium leading-relaxed animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#0a0a0a] w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden my-8 border border-white/10">
            <div className="bg-[#0f0f0f] p-8 flex justify-between items-center text-white border-b border-white/5">
              <div className="flex items-center gap-6">
                <div className="p-2 bg-emerald-500 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Painel Administrativo</h2>
                
                {isAuthorized && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => setAdminTab('config')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${adminTab === 'config' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>Configurações</button>
                    <button onClick={() => setAdminTab('database')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${adminTab === 'database' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>Dados de Emissão ({leads.length})</button>
                  </div>
                )}
              </div>
              <button onClick={() => setIsAdminOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>

            {!isAuthorized ? (
              <div className="p-20 text-center space-y-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Acesso Restrito</h3>
                <form onSubmit={handleAdminLogin} className="max-w-xs mx-auto space-y-6">
                  <div className="space-y-2">
                    <input autoFocus type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-center font-black text-xl outline-none focus:border-emerald-500 transition-all text-white" placeholder="Senha master" />
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Dica: 3312</p>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-emerald-500 transition-all">ENTRAR</button>
                </form>
              </div>
            ) : adminTab === 'config' ? (
              <div className="p-8 md:p-12 space-y-12 max-h-[75vh] overflow-y-auto custom-scrollbar bg-transparent">
                {/* Cabeçalho de Contato e PIX */}
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="font-black text-emerald-500 uppercase text-[10px] tracking-[0.3em] border-b border-white/5 pb-3">Contato e PIX</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <input value={config.whatsappNumber} onChange={e => setConfig({...config, whatsappNumber: e.target.value})} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold outline-none focus:border-emerald-500/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Chave PIX</Label>
                        <input value={config.pixKey} onChange={e => setConfig({...config, pixKey: e.target.value})} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold outline-none focus:border-emerald-500/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>URL do Vídeo de Fundo (Hero)</Label>
                        <div className="flex gap-2">
                          <input value={config.heroVideoUrl} onChange={e => setConfig({...config, heroVideoUrl: e.target.value})} className="flex-1 p-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold outline-none focus:border-emerald-500/50" placeholder="https://..." />
                          <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl transition-all flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <input type="file" className="hidden" accept="video/*" onChange={handleHeroVideoUpload} />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Opacidade do Vídeo (Hero): {Math.round(config.heroVideoOpacity * 100)}%</Label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05" 
                          value={config.heroVideoOpacity} 
                          onChange={e => setConfig({...config, heroVideoOpacity: parseFloat(e.target.value)})} 
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <h3 className="font-black text-emerald-500 uppercase text-[10px] tracking-[0.3em] border-b border-white/5 pb-3">Beneficiário</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <input value={config.pixBeneficiary} onChange={e => setConfig({...config, pixBeneficiary: e.target.value})} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold outline-none focus:border-emerald-500/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Instituição</Label>
                        <input value={config.pixInstitution} onChange={e => setConfig({...config, pixInstitution: e.target.value})} className="w-full p-4 bg-white/5 text-white border border-white/10 rounded-xl font-bold outline-none focus:border-emerald-500/50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gestão do Carrossel */}
                <div className="space-y-10 pt-10 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-black text-emerald-500 uppercase text-[10px] tracking-[0.3em]">Imagens do Carrossel</h3>
                    <button onClick={addCarouselImage} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Novo Slide
                    </button>
                  </div>
                  <div className="grid gap-8">
                    {config.carouselImages.map((img, idx) => (
                      <div key={idx} className="p-8 border border-white/5 rounded-[40px] bg-white/5 grid md:grid-cols-12 gap-8 items-start group relative hover:border-white/10 transition-all">
                        <button onClick={() => removeCarouselImage(idx)} className="absolute -top-3 -right-3 p-3 bg-red-500 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <div className="md:col-span-3 aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black">
                           <img src={img.url || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <div className="md:col-span-9 grid md:grid-cols-2 gap-6">
                           <div className="space-y-6">
                             <div className="space-y-2">
                               <Label>URL da Imagem</Label>
                               <div className="flex gap-2">
                                 <input value={img.url} onChange={e => {
                                   const newImgs = [...config.carouselImages];
                                   newImgs[idx].url = e.target.value;
                                   setConfig({...config, carouselImages: newImgs});
                                 }} className="flex-1 p-4 bg-black/40 text-white text-xs border border-white/10 rounded-xl font-medium outline-none focus:border-emerald-500/50" placeholder="https://..." />
                                 <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl transition-all flex items-center justify-center">
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                   <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} />
                                 </label>
                               </div>
                             </div>
                             <div className="space-y-2">
                               <Label>Título do Slide</Label>
                               <input value={img.title} onChange={e => {
                                 const newImgs = [...config.carouselImages];
                                 newImgs[idx].title = e.target.value;
                                 setConfig({...config, carouselImages: newImgs});
                               }} className="w-full p-4 bg-black/40 text-white text-sm border border-white/10 rounded-xl font-black outline-none focus:border-emerald-500/50 uppercase tracking-tighter" />
                             </div>
                           </div>
                           <div className="space-y-2">
                             <Label>Descrição / Subtítulo</Label>
                             <textarea value={img.desc} onChange={e => {
                               const newImgs = [...config.carouselImages];
                               newImgs[idx].desc = e.target.value;
                               setConfig({...config, carouselImages: newImgs});
                             }} className="w-full p-4 bg-black/40 text-white text-sm border border-white/10 rounded-xl font-medium h-[135px] resize-none outline-none focus:border-emerald-500/50" />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Planos de Preço */}
                <div className="space-y-10 pt-10 border-t border-white/5">
                  <h3 className="font-black text-emerald-500 uppercase text-[10px] tracking-[0.3em]">Edição de Planos</h3>
                  <div className="grid md:grid-cols-3 gap-8">
                    {config.plans.map((plan, idx) => (
                      <div key={plan.id} className="p-8 border border-white/5 rounded-[40px] bg-white/5 space-y-6 hover:border-white/10 transition-all">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <input value={plan.name} onChange={e => {
                            const newPlans = [...config.plans];
                            newPlans[idx].name = e.target.value;
                            setConfig({...config, plans: newPlans});
                          }} className="w-full p-4 bg-black/40 text-white border border-white/10 rounded-xl font-black uppercase tracking-tighter outline-none focus:border-emerald-500/50" />
                        </div>
                        <div className="space-y-2">
                          <Label>Preço</Label>
                          <input value={plan.price} onChange={e => {
                            const newPlans = [...config.plans];
                            newPlans[idx].price = e.target.value;
                            setConfig({...config, plans: newPlans});
                          }} className="w-full p-4 bg-black/40 border border-white/10 rounded-xl font-black text-emerald-500 text-xl tracking-tighter outline-none focus:border-emerald-500/50" />
                        </div>
                        <div className="space-y-3">
                          <Label>Benefícios</Label>
                          {plan.features.map((feat, fIdx) => (
                            <input key={fIdx} value={feat} onChange={e => {
                              const newPlans = [...config.plans];
                              newPlans[idx].features[fIdx] = e.target.value;
                              setConfig({...config, plans: newPlans});
                            }} className="w-full p-3 bg-black/40 text-white text-xs border border-white/10 rounded-xl font-medium outline-none focus:border-emerald-500/50" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-10 sticky bottom-0 bg-[#0a0a0a]/90 backdrop-blur-xl -mx-12 -mb-12 p-12 border-t border-white/5">
                  <button onClick={saveConfig} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl hover:bg-emerald-500 transition-all uppercase tracking-tighter shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    SALVAR ALTERAÇÕES
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar bg-transparent">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="font-black text-white text-2xl uppercase tracking-tighter">Base de Dados de Clientes</h3>
                   <div className="flex flex-wrap gap-4 items-center">
                     {leads.length > 0 && (
                       <>
                         <button onClick={downloadLeadsCSV} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-emerald-500 transition-all flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                           Download CSV
                         </button>
                         <button onClick={downloadLeadsPDF} disabled={isExporting} className="bg-white text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50">
                           {isExporting ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                           Download PDF
                         </button>
                       </>
                     )}
                     <button onClick={() => { setLeads([]); localStorage.removeItem('apsilva_leads'); }} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest underline underline-offset-4">Limpar Tudo</button>
                   </div>
                </div>
                {/* Lista de Leads */}
                <div className="grid gap-6">
                  {leads.length === 0 ? (
                    <div className="text-center py-32 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">Nenhum dado de emissão capturado ainda.</p>
                    </div>
                  ) : leads.map((lead) => (
                    <div key={lead.id} className="bg-white/5 p-8 rounded-[40px] border border-white/5 shadow-sm hover:border-emerald-500/30 transition-all group relative">
                      <button onClick={() => deleteLead(lead.id)} className="absolute top-8 right-8 p-3 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                          <Label>DATA / PLANO</Label>
                          <p className="text-[10px] text-emerald-500 font-black mb-1">{lead.timestamp}</p>
                          <p className="font-black text-white text-sm uppercase tracking-tighter">{lead.planName}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>CLIENTE / DOC</Label>
                          <p className="font-black text-white text-sm tracking-tighter">{lead.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{lead.doc}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>CONTATO</Label>
                          <p className="font-black text-white text-sm tracking-tighter">{lead.whatsapp}</p>
                          <p className="text-xs text-slate-500 font-medium">{lead.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>ENDEREÇO</Label>
                          <p className="font-black text-white text-[10px] leading-tight tracking-tighter">{lead.logradouro}, {lead.numeroCasa} - {lead.bairro}</p>
                          <p className="text-xs text-slate-500 font-medium">{lead.cidade} - {lead.estado} ({lead.cep})</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Funil de Vendas Modal */}
      {funnelStep !== 'landing' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050505]/95 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#0a0a0a] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative my-8 border border-white/5">
            <button onClick={() => setFunnelStep('landing')} className="absolute top-6 right-6 text-slate-500 p-2 z-10 hover:bg-white/5 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div className="p-8 sm:p-12">
              {funnelStep === 'lead' && (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-white">Dados para Emissão</h2>
                    <p className="text-slate-500 font-medium mt-4">Preencha os dados abaixo conforme o documento oficial.</p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-10">
                    {/* Seção 1: Identificação */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">1. Identificação</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Nome Completo</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </span>
                            <Input required className="pl-11" value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} placeholder="Seu nome completo" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>CPF ou CNPJ</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </span>
                            <Input required className="pl-11" value={leadData.doc} onChange={e => setLeadData({...leadData, doc: formatDoc(e.target.value)})} placeholder="000.000.000-00" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Data de Nascimento</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </span>
                            <Input required className="pl-11" type="text" placeholder="DD/MM/AAAA" value={leadData.birthDate} onChange={e => setLeadData({...leadData, birthDate: formatBirthDate(e.target.value)})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </span>
                            <Input required className="pl-11" type="email" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} placeholder="exemplo@email.com" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seção 2: Endereço */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">2. Endereço</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label>CEP</Label>
                          <div className="relative">
                            <Input required value={leadData.cep} onChange={e => setLeadData({...leadData, cep: formatCEP(e.target.value)})} placeholder="00000-000" />
                            {isFetchingCep && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <Label>Logradouro</Label>
                          <Input required value={leadData.logradouro} onChange={e => setLeadData({...leadData, logradouro: e.target.value})} placeholder="Rua, Avenida..." />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2"><Label>Número</Label><Input required value={leadData.numeroCasa} onChange={e => setLeadData({...leadData, numeroCasa: e.target.value})} placeholder="123" /></div>
                        <div className="space-y-2"><Label>Bairro</Label><Input required value={leadData.bairro} onChange={e => setLeadData({...leadData, bairro: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Cidade</Label><Input required value={leadData.cidade} onChange={e => setLeadData({...leadData, cidade: e.target.value})} /></div>
                        <div className="space-y-2"><Label>Estado</Label><Input required value={leadData.estado} onChange={e => setLeadData({...leadData, estado: e.target.value})} /></div>
                      </div>
                    </div>

                    {/* Seção 3: Contato */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">3. Finalização</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label>WhatsApp</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </span>
                            <Input required className="pl-11" value={leadData.whatsapp} onChange={e => setLeadData({...leadData, whatsapp: formatPhone(e.target.value)})} placeholder="(00) 00000-0000" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl mt-6 uppercase tracking-tighter shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                      <span>Continuar para Pagamento</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                  </form>
                </div>
              )}
              {funnelStep === 'payment' && (
                <div className="space-y-10">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Pagamento Seguro</h2>
                  </div>
                  
                  {isProcessing ? (
                    <div className="text-center py-20 space-y-8">
                      <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
                      <p className="text-emerald-500 font-black text-2xl uppercase tracking-tighter">Confirmando pagamento...</p>
                    </div>
                  ) : showPixDetails ? (
                    <div className="bg-emerald-500/5 p-10 rounded-[40px] border border-emerald-500/20 text-center space-y-8">
                      <h3 className="font-black text-emerald-500 text-xl uppercase tracking-[0.2em]">Pagar via PIX</h3>
                      <div className="text-left space-y-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                        <div className="space-y-1"><Label>Beneficiário</Label><p className="font-black text-white text-lg tracking-tighter">{config.pixBeneficiary}</p></div>
                        <div className="space-y-1"><Label>Instituição</Label><p className="font-black text-white text-lg tracking-tighter">{config.pixInstitution}</p></div>
                        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                          <div className="overflow-hidden w-full"><Label>Chave PIX</Label><p className="font-black text-emerald-500 text-lg break-all tracking-tighter">{config.pixKey}</p></div>
                          <button onClick={() => copyToClipboard(config.pixKey)} className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-emerald-500 transition-all uppercase tracking-tighter">COPIAR</button>
                        </div>
                      </div>
                      <button onClick={processPayment} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-xl shadow-xl hover:bg-emerald-500 transition-all uppercase tracking-tighter">JÁ PAGUEI</button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      <button onClick={() => setShowPixDetails(true)} className="w-full flex items-center justify-between p-8 bg-white/5 border border-white/5 rounded-[32px] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group">
                        <div className="text-left">
                          <p className="font-black text-white uppercase tracking-tighter text-xl">PIX INSTANTÂNEO</p>
                          <p className="text-slate-500 text-sm font-medium">Liberação imediata após o pagamento</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {funnelStep === 'success' && (
                <div className="text-center space-y-8 py-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  
                  <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">SUCESSO! 🚀</h2>
                  
                  <div className="w-full px-4">
                    <div className="border border-emerald-500/20 bg-emerald-500/5 p-8 rounded-3xl">
                      <p className="text-slate-300 font-bold leading-relaxed text-lg">
                        Aguardando confirmação de pagamento. Clique abaixo para finalizar a emissão pelo WhatsApp.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-8 w-full px-8">
                    <p className="text-emerald-500 font-black uppercase text-xs tracking-[0.3em]">
                      CADASTRO CONCLUÍDO COM SUCESSO
                    </p>
                    <button 
                      onClick={finalizeSale} 
                      className="w-full bg-[#25D366] text-white py-6 rounded-3xl font-black text-2xl shadow-[0_0_40px_rgba(37,211,102,0.3)] transition-all hover:scale-105 active:scale-95 uppercase tracking-tighter"
                    >
                      FALAR NO WHATSAPP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#050505] text-white pt-32 pb-16 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left space-y-4">
            <span className="text-3xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">APSILVA CERTIFICADORA</span>
            <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Todos os direitos reservados. Excelência em Certificação Digital.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <button onClick={() => { setIsAdminOpen(true); setIsAuthorized(false); setAdminPass(''); }} className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] hover:text-emerald-500 transition-colors p-3 flex items-center gap-3 group border border-white/5 rounded-full px-6">
              <svg className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Painel Restrito
            </button>
          </div>
        </div>
      </footer>

      <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 bg-[#25D366] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all z-50 active:scale-95">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </a>
    </div>
  );
};

export default App;