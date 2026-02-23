
export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export interface LeadRecord {
  id: string;
  timestamp: string;
  planName: string;
  name: string;
  doc: string;
  whatsapp: string;
  email: string;
  cep: string;
  logradouro: string;
  numeroCasa: string;
  bairro: string;
  cidade: string;
  estado: string;
  birthDate: string;
}
