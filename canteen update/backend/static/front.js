function loadMenu(){
const today = new Date().toISOString().split('T')[0];
document.getElementById('menu-date').textContent = `Menu for: ${today}`;


let menu = JSON.parse(localStorage.getItem('menu')) || [];
let todayMenu = menu.filter(item => item.date === today);


const menuDiv = document.getElementById('menu');
menuDiv.innerHTML = '';


if(todayMenu.length === 0){
menuDiv.innerHTML = '<p>No menu items for today.</p>';
return;
}


todayMenu.forEach(item => {
const div = document.createElement('div');
div.className = 'menu-item';
div.innerHTML = `
<h3>${item.name}</h3>
<p>${item.desc}</p>
<button onclick='addItem(${item.id})'>Add</button>
`;
menuDiv.appendChild(div);
});
}


let selected = [];


function addItem(id){
const menu = JSON.parse(localStorage.getItem('menu'));
const item = menu.find(i => i.id === id);
selected.push(item);
renderSelected();
}


function renderSelected(){
const ul = document.getElementById('selected-items');
ul.innerHTML = '';


selected.forEach((item, i) => {
const li = document.createElement('li');
li.textContent = item.name + " ";


const btn = document.createElement('button');
btn.textContent = "Remove";
btn.onclick = () => { selected.splice(i,1); renderSelected(); };


li.appendChild(btn);
ul.appendChild(li);
});
}


document.getElementById('submit-order').onclick = () => {
const name = document.getElementById('employee-name').value.trim();
if(name === '' || selected.length === 0){
document.getElementById('feedback').textContent = 'Enter your name and select items.';
return;
}

document.getElementById('submit-order').onclick = () => {
const number = document.getElementById('employee-number').value.trim();
if(number === '' || selected.length === 0){
document.getElementById('Employee-number').textContent = 'Enter Employee Number.';
return;
}
}


let orders = JSON.parse(localStorage.getItem('orders')) || [];
orders.push({ employee: name, items: selected, time: new Date().toLocaleString() });


localStorage.setItem('orders', JSON.stringify(orders));


document.getElementById('feedback').textContent = 'Order submitted successfully!';
selected = [];
renderSelected();
};


loadMenu();