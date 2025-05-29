from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load mô hình
model = joblib.load('house_price_model.pkl')

# Load dữ liệu gốc để phục vụ trực quan hóa
data = pd.read_csv('train.csv')


@app.route('/')
def home():
    return "API Dự đoán & Trực quan hóa giá nhà đang hoạt động!"

# ----------- API Dự đoán -----------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data_input = request.get_json()
        input_df = pd.DataFrame([data_input])
        predicted_price = model.predict(input_df)[0]

        return jsonify({
            'predicted_price': round(predicted_price, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)})

# ----------- API Trực quan hóa -----------

@app.route('/chart/price-distribution', methods=['GET'])
def price_distribution():
    prices = data['SalePrice'].dropna()
    bins = pd.cut(prices, bins=10)
    counts = prices.groupby(bins).count()

    chart_data = [
        {'range': str(index), 'count': int(value)}
        for index, value in counts.items()
    ]
    return jsonify(chart_data)

@app.route('/chart/area-vs-price', methods=['GET'])
def area_vs_price():
    df = data[['GrLivArea', 'SalePrice']].dropna().sample(200)  # Giới hạn 200 điểm
    chart_data = df.to_dict(orient='records')
    return jsonify(chart_data)

@app.route('/chart/average-price-by-neighborhood', methods=['GET'])
def avg_price_by_neighborhood():
    df = data[['Neighborhood', 'SalePrice']].dropna()
    grouped = df.groupby('Neighborhood')['SalePrice'].mean().sort_values(ascending=False)

    chart_data = [
        {'neighborhood': index, 'avg_price': round(value, 2)}
        for index, value in grouped.items()
    ]
    return jsonify(chart_data)

if __name__ == '__main__':
    app.run(debug=True)
