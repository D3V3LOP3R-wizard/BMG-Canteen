document.getElementById('add-item').addEventListener('click', async () => {
	try {
		const token = document.getElementById('admin-token').value;
		const name = document.getElementById('item-name').value.trim();
		const desc = document.getElementById('item-desc').value.trim();
		const date = document.getElementById('item-date').value.trim();
		const statusEl = document.getElementById('add-status');
		if (!name) { statusEl.textContent = 'Name required'; return; }

		const resp = await fetch('/api/menu', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-ADMIN-TOKEN': token },
			body: JSON.stringify({ name, description: desc, date })
		});

		if (!resp.ok) {
			statusEl.textContent = 'Server error: ' + resp.status;
			return;
		}

		const data = await resp.json();
		if (data.status === 'item_added') {
			statusEl.textContent = 'Item added successfully';
			// clear inputs after success
			document.getElementById('item-name').value = '';
			document.getElementById('item-desc').value = '';
			document.getElementById('item-date').value = '';
		} else if (data.error) {
			statusEl.textContent = data.error;
		} else {
			statusEl.textContent = 'Unexpected response from server';
		}
	} catch (err) {
		document.getElementById('add-status').textContent = 'Error: ' + (err && err.message ? err.message : String(err));
	}
});