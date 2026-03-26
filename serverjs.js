const express = require('express');
const bodyParser = require('body-parser');
const midtransClient = require('midtrans-client');
const path = require('path');

const app = express();
app.use(bodyParser.json());


let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'Mid-server-iyU_v98lcWTjM1KsvhR4Xa4z',
  clientKey: 'Mid-client-67s2LUw5jQq9o8Us'
});


app.post('/create-transaction', async (req, res) => {
  console.log("Request masuk:", req.body);

  const { total, pesanan, items, nama } = req.body;

  let item_details = [];

  if (items && Array.isArray(items)) {
    item_details = items;
  } else if (pesanan && Array.isArray(pesanan)) {

    item_details = pesanan.map((item, index) => {
      let namaItem = item.nama;

      
      if (item.level !== undefined && item.level > 0) {
        namaItem += ` (Level ${item.level})`;
      }

      
      if (item.note && item.note.trim() !== "") {
        namaItem += ` - Note: ${item.note}`;
      }

      return {
        id: `${item.nama}-${index}`, 
        price: item.harga,
        quantity: item.jumlah,
        name: namaItem
      };
    });
  }

  let parameter = {
    transaction_details: {
      order_id: `ORDER-${Date.now()}`,
      gross_amount: total
    },
    item_details: item_details,
    customer_details: {
      first_name: nama
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token });
  } catch (err) {
    console.error("Midtrans error:", err);
    res.status(500).send(err.message);
  }
});


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
