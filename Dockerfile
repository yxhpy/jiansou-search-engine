# 浣跨敤Python 3.11浣滀负鍩虹闀滃儚 - 浣跨敤闃块噷浜戦暅鍍忔簮
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/python:3.11-slim

# 璁剧疆宸ヤ綔鐩綍
WORKDIR /app

# 璁剧疆鐜鍙橀噺
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 澶嶅埗渚濊禆鏂囦欢
COPY requirements.txt .

# 瀹夎Python渚濊禆鍜屽繀瑕佺殑绯荤粺宸ュ叿 - 浣跨敤闃块噷浜憄ip婧?
RUN pip install -i https://mirrors.aliyun.com/pypi/simple/ --no-cache-dir -r requirements.txt && \
    apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 鍒涘缓闈瀝oot鐢ㄦ埛
RUN adduser --disabled-password --gecos '' appuser

# 澶嶅埗搴旂敤浠ｇ爜
COPY . .

# 纭繚鏂扮増鏈枃浠跺瓨鍦?
RUN ls -la /app/main_new.py /app/index_new.html /app/app/ || exit 1

# 璁剧疆鍚姩鑴氭湰鏉冮檺
RUN chmod +x start.sh

# 璁剧疆搴旂敤鏉冮檺
RUN chown -R appuser:appuser /app && \
    chmod -R 755 /app

# 鍒囨崲鍒伴潪root鐢ㄦ埛
USER appuser

# 鏆撮湶绔彛
EXPOSE 8000

# 鍋ュ悍妫€鏌?
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# 浣跨敤鍚姩鑴氭湰
CMD ["./start.sh"] 
