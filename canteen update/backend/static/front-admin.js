document.getElementById('add-item').onclick = () =>{
const name = document.getElementById('item-name').value.trim();
const desc = document.getElementById('item-desc').value.trim();
let date = document.getElementById('item-date').value.trim();


if(date === ''){
date = new Date().toISOString().split('T')[0];
}


if(name === ''){
document.getElementById('add-status').textContent = 'Name required!';
return;
}


let menu = JSON.parse(localStorage.getItem('menu')) || [];
const id = menu.length ? menu[menu.length - 1].id + 1 : 1;


menu.push({ id, name, desc, date });
localStorage.setItem('menu', JSON.stringify(menu));


document.getElementById('add-status').textContent = 'Item added!';
};


// Load orders
function loadOrders(){
let orders = JSON.parse(localStorage.getItem('orders')) || [];
const ul = document.getElementById('orders-list');
ul.innerHTML = '';


orders.forEach(order => {
const li = document.createElement('li');
li.textContent = `${order.time} — ${order.employee}: ${order.items.map(i=>i.name).join(', ')}`;
ul.appendChild(li);
});
}


loadOrders();