(async () => {
  const p = await fetch("http://localhost:3000/api/admin/platforms", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      title: "Test Platform",
      price: "100"
    })
  }).then(r => r.json());
  
  console.log("Inserted:", p.id);
  
  const d = await fetch("http://localhost:3000/api/admin/platforms/" + p.id, {
    method: "DELETE"
  }).then(r => r.json());
  
  console.log("Delete result:", d);
  process.exit(0);
})();
