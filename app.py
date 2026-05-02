from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

PHP_BACKEND = "https://pawsparadise.xo.je/admin/"

# ==========================================
# PROXY - evita el problema CORS
# ==========================================

@app.route('/api/productos', methods=['GET'])
def proxy_productos():
    try:
        accion = request.args.get('accion', 'listar')
        r = requests.get(PHP_BACKEND + f'productos_api.php?accion={accion}', timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def proxy_login():
    try:
        r = requests.post(PHP_BACKEND + 'login_ajax.php', data=request.form, timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/registro', methods=['POST'])
def proxy_registro():
    try:
        r = requests.post(PHP_BACKEND + 'registro.php', data=request.form, timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/pedidos', methods=['GET', 'POST'])
def proxy_pedidos():
    try:
        if request.method == 'GET':
            r = requests.get(PHP_BACKEND + 'pedidos_api.php', params=request.args, timeout=10)
        else:
            r = requests.post(PHP_BACKEND + 'pedidos_api.php', data=request.form, timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/cerrar_sesion', methods=['POST'])
def proxy_cerrar_sesion():
    try:
        r = requests.post(PHP_BACKEND + 'cerrar_sesion.php', timeout=10)
        return jsonify(r.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==========================================
# PÁGINAS
# ==========================================

@app.route('/')
@app.route('/index.html')
def home():
    return render_template('index.html')

@app.route('/<page_name>.html')
def render_page(page_name):
    try:
        return render_template(f'{page_name}.html')
    except:
        return "Página no encontrada", 404

@app.route('/panel_admin.html')
def panel_admin():
    return render_template('panel_admin.html')

@app.route('/mis_pedidos.html')
def mis_pedidos():
    return render_template('mis_pedidos.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)