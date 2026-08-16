(async () => {
  const p = await fetch("http://localhost:3000/api/admin/platforms", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      title: "Test Platform With Orders",
      price: "100"
    })
  }).then(r => r.json());
  
  console.log("Inserted Platform:", p.id);
  
  const o = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      platformId: p.id,
      buyerName: "Test Buyer",
      buyerEmail: "test@test.com",
      paymentMethod: "vodafone"
    })
  }).then(r => r.json());
  
  console.log("Inserted Order:", o.success);
  
  const d = await fetch("http://localhost:3000/api/admin/platforms/" + p.id, {
    method: "DELETE"
  }).then(r => r.json());
  
  console.log("Delete result:", d);
  process.exit(0);
})();
