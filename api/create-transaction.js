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
        item_details = items;
    } else if (pesanan && Array.isArray(pesanan)) {
        item_details = pesanan.map((item, index) => {
            let namaItem = item.nama;
            if (item.level !== undefined && item.level > 0) {
                namaItem += ` Level ${item.level}`;
            }
            if (item.note && item.note.trim() !== "") {
                namaItem += ` Note ${item.note}`;
            }
            return {
                id: `${item.nama.replace(/\s/g, '_')}_${index}`,
                price: item.harga,
                quantity: item.jumlah,
                name: namaItem.substring(0, 50)
            };
        });
    }

    const parameter = {
        transaction_details: {
            order_id: `ORDER_${Date.now()}`,
            gross_amount: total
        },
        item_details: item_details,
        customer_details: {
            first_name: nama
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
