const midtransClient = require('midtrans-client');
 
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
 
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
 
    const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
    });
 
    const { total, pesanan, items, nama } = req.body;
 
    let item_details = [];
    if (items && Array.isArray(items)) {
        item_details = items.map((item, index) => ({
            id: `ITEM_${index}`,
            price: item.price,
            quantity: item.quantity,
            name: item.name
                .replace(/[^a-zA-Z0-9 ]/g, '')
                .trim()
                .substring(0, 50) || `Item ${index}`
        }));
    } else if (pesanan && Array.isArray(pesanan)) {
        item_details = pesanan.map((item, index) => {
            let namaItem = item.nama || `Item ${index}`;
            namaItem = namaItem.replace(/[^a-zA-Z0-9 ]/g, '').trim().substring(0, 50);
            return {
                id: `ITEM_${index}`,
                price: item.harga,
                quantity: item.jumlah,
                name: namaItem || `Item ${index}`
            };
        });
    }
 
    const cleanNama = (nama || 'Pelanggan')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
        .substring(0, 50);
 
    const parameter = {
        transaction_details: {
            order_id: `ORDER_${Date.now()}`,
            gross_amount: total
        },
        item_details: item_details,
        customer_details: {
            first_name: cleanNama
        }
    };
 
    try {
        const transaction = await snap.createTransaction(parameter);
        res.status(200).json({ token: transaction.token });
    } catch (err) {
        console.error('Midtrans error:', err);
        res.status(500).json({ error: err.message });
    }
};
