"""
应用启动文件
"""
import uvicorn
from app.main import app
from app.config import AppConfig

if __name__ == "__main__":
    uvicorn.run(app, host=AppConfig.HOST, port=AppConfig.PORT) 