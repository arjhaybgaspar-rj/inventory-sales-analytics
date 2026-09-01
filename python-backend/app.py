from flask import Flask
from flask_cors import CORS
from routes.barcode_routes import barcode_bp
from routes.product_routes import product_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(barcode_bp)
app.register_blueprint(product_bp)


@app.route("/")
def home():
    return "Inventory Sales Analytics API is running!"


if __name__ == "__main__":
    app.run(debug=True)