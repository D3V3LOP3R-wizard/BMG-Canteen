from flask import Flask, request, jsonify, send_from_directory, g
import sqlite3
import os
import json
from datetime import date

# Application setup
BASE_DIR = os.path.dirname(__file__)
DATABASE = os.path.join(BASE_DIR, 'data.db')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'admin-secret')

app = Flask(__name__, static_folder='static', static_url_path='')


def get_db():
	db = getattr(g, '_database', None)
	if db is None:
		db = g._database = sqlite3.connect(DATABASE)
		db.row_factory = sqlite3.Row
		# ensure tables exist
		db.execute('''CREATE TABLE IF NOT EXISTS menu_items (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT,
			date TEXT NOT NULL,
			available INTEGER NOT NULL DEFAULT 1
		)''')
		db.execute('''CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY,
			employee_name TEXT,
			items_json TEXT,
			timestamp TEXT
		)''')
		db.commit()
	return db


@app.teardown_appcontext
def close_connection(exception):
	db = getattr(g, '_database', None)
	if db is not None:
		db.close()


@app.route('/')
def root():
	return app.send_static_file('index.html')


# API: get menu for a date (default today)
@app.route('/api/menu', methods=['GET'])
def get_menu():
	qdate = request.args.get('date') or date.today().isoformat()
	db = get_db()
	cur = db.execute('SELECT id, name, description, date, available FROM menu_items WHERE date = ? AND available = 1', (qdate,))
	items = [dict(row) for row in cur.fetchall()]
	return jsonify({'date': qdate, 'items': items})


# API: add menu item (admin only)
@app.route('/api/menu', methods=['POST'])
def add_menu_item():
	token = request.headers.get('X-ADMIN-TOKEN')
	if token != ADMIN_TOKEN:
		return jsonify({'error': 'unauthorized'}), 401
	data = request.get_json() or {}
	name = data.get('name')
	description = data.get('description', '')
	qdate = data.get('date') or date.today().isoformat()
	if not name:
		return jsonify({'error': 'missing name'}), 400
	db = get_db()
	db.execute('INSERT INTO menu_items (name, description, date, available) VALUES (?, ?, ?, 1)', (name, description, qdate))
	db.commit()
	# frontend expects status 'item_added'
	return jsonify({'status': 'item_added'})


# API: submit order
@app.route('/api/order', methods=['POST'])
def submit_order():
	data = request.get_json() or {}
	employee_name = data.get('employee_name', 'Anonymous')
	items = data.get('items') or []
	if not items:
		return jsonify({'error': 'no items selected'}), 400
	db = get_db()
	db.execute('INSERT INTO orders (employee_name, items_json, timestamp) VALUES (?, ?, ?)', (employee_name, json.dumps(items), date.today().isoformat()))
	db.commit()
	return jsonify({'status': 'order_received'})


# API: list orders (admin)
@app.route('/api/orders', methods=['GET'])
def list_orders():
	token = request.headers.get('X-ADMIN-TOKEN')
	if token != ADMIN_TOKEN:
		return jsonify({'error': 'unauthorized'}), 401
	db = get_db()
	cur = db.execute('SELECT id, employee_name, items_json, timestamp FROM orders ORDER BY id DESC')
	rows = [dict(r) for r in cur.fetchall()]
	# parse items_json
	for r in rows:
		r['items'] = json.loads(r.pop('items_json') or '[]')
	return jsonify({'orders': rows})


if __name__ == '__main__':
	# ensure database file exists/initialized
	os.makedirs(BASE_DIR, exist_ok=True)
	app.run(debug=True)