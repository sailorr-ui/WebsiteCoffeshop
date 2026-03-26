console.log("JS TERLOAD");

document.addEventListener("DOMContentLoaded", function() {

    var btnBayar = document.getElementById("bayar-btn");

    if (!btnBayar) {
        console.log("Tombol tidak ditemukan");
        return;
    }

    btnBayar.addEventListener("click", function() {

        console.log("Tombol diklik");

        fetch("/create-transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ total: 30000 })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            console.log("Response server:", data);

            if (data.token) {
                snap.pay(data.token);
            }
        })
        .catch(function(error) {
            console.log("Fetch error:", error);
        });

    });

});
