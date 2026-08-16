const id = "00000000-0000-0000-0000-000000000000";
fetch("http://localhost:3000/api/admin/platforms/" + id, {method: 'DELETE'})
.then(r => r.text())
.then(console.log)
