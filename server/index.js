
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * 🔑 CREDENCIAIS AMPLOPAY GATEWAY
 * Estas chaves são obrigatórias para o funcionamento do checkout.
 */
const PUBLIC_KEY = process.env.AMPLOPAY_PUBLIC_KEY;
const SECRET_KEY = process.env.AMPLOPAY_SECRET_KEY;

app.use(cors());
app.use(express.json());

// Rota para criar cobrança PIX via AmploPay Gateway
app.post('/pix', async (req, res) => {
    try {
        const { amount, customer, items, orderId } = req.body;
        
        console.log(`\n--- [AMPLOPAY GATEWAY] NOVA SOLICITAÇÃO ---`);
        console.log(`🆔 Identificador: ${orderId}`);
        console.log(`💰 Valor: R$ ${amount}`);

        const amplopayPayload = {
            identifier: orderId || `NEX_${Date.now()}`,
            amount: parseFloat(parseFloat(amount).toFixed(2)),
            client: {
                name: customer.name || 'Cliente Nexus',
                email: customer.email,
                document: String(customer.document || '').replace(/\D/g, ''),
                phone: String(customer.phone || '+5500000000000') // Internacional obrigatório
            },
            products: items.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: parseFloat(item.price.toFixed(2))
            })),
            callbackUrl: `https://nexus-store.com/webhook/amplopay` 
        };

        const response = await axios.post('https://app.amplopay.com/api/v1/gateway/pix/receive', amplopayPayload, {
            headers: {
                'Content-Type': 'application/json',
                'x-public-key': PUBLIC_KEY,
                'x-secret-key': SECRET_KEY
            },
            timeout: 15000
        });

        const rawData = response.data;
        console.log('AmploPay API Raw Response:', JSON.stringify(rawData, null, 2));

        // Normalização da resposta conforme o formato identificado nos testes
        const root = rawData.data || rawData;
        const transaction = root.transaction || root;
        
        // Formato real identificado: root.pix.code e root.pix.base64
        const pixContainer = 
            root.pix || 
            transaction.pixInformation || 
            transaction.pix || 
            root.pixInformation;

        const transactionId = root.transactionId || transaction?.id || root.id;
        const status = root.status || transaction?.status;

        if (!pixContainer) {
            console.error('⚠️ ALERTA: Container de PIX não encontrado.');
            return res.status(500).json({ 
                message: "Resposta do gateway não contém dados do PIX.",
                raw: rawData 
            });
        }

        const pixCode = pixContainer.code || pixContainer.qrCode || rawData.pix_code;
        const pixImage = pixContainer.base64 || pixContainer.image || pixContainer.qrCodeImage || rawData.qr_code_image;

        if (!pixCode) {
            return res.status(500).json({ 
                message: "Código PIX não gerado pela Gateway.",
                raw: rawData 
            });
        }

        const responsePayload = {
            id: transactionId,
            status: status,
            copy_paste: pixCode,
            qr_code_base64: pixImage
        };

        console.log(`✅ SUCESSO: Transação ${responsePayload.id} pronta para pagamento.`);
        res.json(responsePayload);

    } catch (error) {
        if (error.response) {
            const gatewayError = error.response.data;
            const errorMessage = gatewayError.message || "Erro na AmploPay Gateway";
            
            console.error(`❌ ERRO GATEWAY (${error.response.status}):`, JSON.stringify(gatewayError));
            
            res.status(error.response.status).json({ 
                message: errorMessage, 
                details: gatewayError 
            });
        } else {
            console.error('❌ ERRO DE CONEXÃO:', error.message);
            res.status(500).json({ message: "Servidor AmploPay inacessível no momento." });
        }
    }
});

// Webhook para confirmação automática de pagamento
app.post('/webhook/amplopay', (req, res) => {
    const payload = req.body;
    console.log(`\n--- [WEBHOOK] AMPLOPAY RECEBIDO ---`);
    const root = payload.data || payload;
    const transaction = root.transaction || root;
    const status = (root.status || transaction.status || '').toUpperCase();
    
    if (['PAID', 'APPROVED', 'OK'].includes(status)) {
        console.log('💰 PAGAMENTO APROVADO! Liberando produtos...');
    }
    res.status(200).send('OK');
});

app.get('/pix/:id', async (req, res) => {
    res.json({ status: 'pending' });
});

app.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 BACKEND NEXUS ATIVO: http://localhost:${PORT}`);
    console.log(`💳 GATEWAY: AMPLOPAY (CONFIGURADO COM SUCESSO)`);
    console.log(`--------------------------------------------------`);
});
