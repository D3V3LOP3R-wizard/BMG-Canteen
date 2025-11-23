async function loadMenu(){
const resp = await fetch('/api/menu');
const data = await resp.json();
document.getElementById('menu-date').textContent = 'Menu for: ' + data.date;
const menu = document.getElementById('menu');
menu.innerHTML = '';
if(!data.items.length){
menu.innerHTML = '<p>No items for today.</p>';
return;
}
data.items.forEach(it => {
const div = document.createElement('div');
div.className = 'menu-item';
div.innerHTML = `<h3>${it.name}</h3><p>${it.description || ''}</p><button data-id='${it.id}'>Add</button>`;
const btn = div.querySelector('button');
btn.addEventListener('click', ()=> addToSelected(it));
menu.appendChild(div);
});
}


const selected = [];
function addToSelected(item){
selected.push(item);
renderSelected();
}
function renderSelected(){
const ul = document.getElementById('selected-list');
ul.innerHTML = '';
selected.forEach((it, idx) => {
const li = document.createElement('li');
li.textContent = it.name + ' ';
const rm = document.createElement('button');
rm.textContent = 'Remove';
rm.addEventListener('click', ()=>{ selected.splice(idx,1); renderSelected(); });
li.appendChild(rm);
ul.appendChild(li);
});
}


document.getElementById('submit-order').addEventListener('click', async ()=>{
const name = document.getElementById('employee-name').value || 'Anonymous';
if(selected.length===0){ document.getElementById('order-status').textContent = 'Select items first.'; return; }
const payload = { employee_name: name, items: selected };
const resp = await fetch('/api/order',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
const data = await resp.json();
if(data.status==='order_received'){
document.getElementById('order-status').textContent = 'Order received — thank you!';
selected.length = 0; renderSelected();
} else {
document.getElementById('order-status').textContent = data.error || 'Error';
}
});


loadMenu();