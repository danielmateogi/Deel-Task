export interface BaseAttributes {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends BaseAttributes {
  firstName: string;
  lastName: string;
  profession: string;
  balance: number;
  type: 'client' | 'contractor';
}

export interface Contract extends BaseAttributes {
  terms: string;
  status: 'new' | 'in_progress' | 'terminated';
  ContractorId: number;
  ClientId: number;
  Contractor?: Profile;
  Client?: Profile;
  Jobs: Pick<Job, 'id' | 'paid'>[];
}

export interface Job extends BaseAttributes {
  description: string;
  price: number;
  paid: boolean;
  paymentDate: string;
  ContractId: number;
  Contract?: Contract;
}

export interface BestClient {
  id: number;
  fullName: string;
  paid: number;
}