import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load dữ liệu
df = pd.read_csv('train.csv')

# Chọn các cột đặc trưng đơn giản để huấn luyện (có thể mở rộng sau)
features = ['GrLivArea', 'BedroomAbvGr', 'FullBath', 'Neighborhood']
target = 'SalePrice'

df = df[features + [target]].dropna()

# Chia features và target
X = df[features]
y = df[target]

# Tách tập train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Xử lý biến phân loại với OneHotEncoder
categorical_features = ['Neighborhood']
numeric_features = ['GrLivArea', 'BedroomAbvGr', 'FullBath']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
        ('num', 'passthrough', numeric_features)
    ])

# Tạo pipeline hồi quy
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

# Huấn luyện mô hình
model.fit(X_train, y_train)

# Dự đoán
y_pred = model.predict(X_test)

# Đánh giá
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)
print(f"RMSE: {rmse:.2f}")
print(f"R² Score: {r2:.2f}")

# Lưu pipeline (model + encoder)
joblib.dump(model, 'house_price_model.pkl')

