from flask import Flask, render_template

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)

@app.route('/panel_admin.html')
def panel_admin():
    return render_template('panel_admin.html')

@app.route('/mis_pedidos.html')
def mis_pedidos():
    return render_template('mis_pedidos.html')