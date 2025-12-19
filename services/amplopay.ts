import { CartItem, User } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; 

export interface PaymentResponse {
  id: string;
  qr_code_base64: string | null; 
  copy_paste: string;
  status: string;
}

export const AmploPayService = {
  /**
   * Cria uma transação PIX chamando o BACKEND para AmploPay Gateway
   */
  createPayment: async (user: User, cart: CartItem[], total: number): Promise<PaymentResponse> => {
    const payload = {
      orderId: `NEX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: total,
      customer: {
        name: user.name,
        email: user.email,
        document: user.document ? user.document.replace(/\D/g, '') : '00000000000',
        phone: user.phone || '+5500000000000'
      },
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const response = await fetch(`${BACKEND_URL}/pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao processar pagamento na Gateway.");
      }

      // O backend agora retorna os campos normalizados
      return {
        id: data.id,
        qr_code_base64: data.qr_code_base64 || null, 
        copy_paste: data.copy_paste || '',
        status: data.status || 'pending'
      };

    } catch (error: any) {
      if (error.message?.includes('Failed to fetch')) {
          throw new Error("O servidor local (node index.js) não está rodando.");
      }
      throw error;
    }
  },

  /**
   * Consulta o status da transação
   */
  checkStatus: async (transactionId: string): Promise<'pending' | 'paid' | 'failed'> => {
    try {
      const response = await fetch(`${BACKEND_URL}/pix/${transactionId}`);
      if (!response.ok) return 'pending';
      const data = await response.json();
      
      const status = (data.status || '').toLowerCase();
      
      // Mapeamento AmploPay Gateway Status
      if (['paid', 'completed', 'approved', 'pago', 'ok'].includes(status)) return 'paid';
      if (['failed', 'canceled', 'recusado', 'expired', 'cancelled'].includes(status)) return 'failed';

      return 'pending';
    } catch (error) {
      return 'pending';
    }
  }
};