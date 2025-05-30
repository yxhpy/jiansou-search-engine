"""
壁纸相关路由
提供壁纸代理服务，解决前端CORS问题
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import httpx
import asyncio
from typing import Optional
import logging
import random
import time

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/wallpaper", tags=["wallpaper"])

# 支持的壁纸源配置
WALLPAPER_SOURCES = {
    "unsplash": {
        "base_url": "https://source.unsplash.com",
        "categories": ["nature", "landscape", "abstract", "minimal", "architecture"]
    },
    "picsum": {
        "base_url": "https://picsum.photos",
        "blur_support": True
    },
    "bing": {
        "base_url": "https://api.dujin.org/bing",
        "resolutions": ["1920", "1366", "1080"]
    }
}


@router.get("/random")
async def get_random_wallpaper(
    source: str = Query("unsplash", description="壁纸源: unsplash, picsum, bing"),
    width: float = Query(1920, description="图片宽度"),
    height: float = Query(1080, description="图片高度"),
    category: Optional[str] = Query(None, description="图片分类（仅unsplash支持）"),
    blur: Optional[int] = Query(None, description="模糊程度（仅picsum支持）")
):
    """
    获取随机壁纸
    通过后端代理请求，解决前端CORS问题
    """
    try:
        # 将浮点数转换为整数，避免参数验证错误
        width = int(round(width))
        height = int(round(height))
        
        # 验证参数范围
        if width <= 0 or height <= 0:
            raise HTTPException(status_code=400, detail="图片尺寸必须大于0")
        if width > 10000 or height > 10000:
            raise HTTPException(status_code=400, detail="图片尺寸不能超过10000像素")
        
        # 特殊处理必应壁纸
        if source == "bing":
            # 随机选择过去30天内的某一天
            random_days = random.randint(0, 30)
            
            # 使用必应官方API获取历史壁纸
            async with httpx.AsyncClient(timeout=15.0) as client:
                api_url = f"https://www.bing.com/HPImageArchive.aspx?format=js&idx={random_days}&n=1&mkt=zh-CN"
                response = await client.get(api_url)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("images") and len(data["images"]) > 0:
                        image_info = data["images"][0]
                        base_url = "https://www.bing.com"
                        image_url = base_url + image_info["url"]
                        
                        # 获取实际的图片
                        img_response = await client.get(image_url, follow_redirects=True)
                        if img_response.status_code == 200:
                            return StreamingResponse(
                                _iter_content(img_response.content),
                                media_type=img_response.headers.get("content-type", "image/jpeg"),
                                headers={
                                    "Cache-Control": "public, max-age=3600",
                                    "Access-Control-Allow-Origin": "*",
                                    "Access-Control-Allow-Methods": "GET",
                                    "Access-Control-Allow-Headers": "*"
                                }
                            )
                        else:
                            raise HTTPException(status_code=500, detail="获取必应壁纸图片失败")
                    else:
                        raise HTTPException(status_code=404, detail="未找到必应壁纸数据")
                else:
                    raise HTTPException(status_code=500, detail="获取必应壁纸失败")
        
        # 处理其他壁纸源
        wallpaper_url = _build_wallpaper_url(source, width, height, category, blur)
        
        # 通过代理获取图片
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(wallpaper_url, follow_redirects=True)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"获取壁纸失败: {response.status_code}"
                )
            
            # 返回图片流
            return StreamingResponse(
                _iter_content(response.content),
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={
                    "Cache-Control": "public, max-age=3600",  # 缓存1小时
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "*"
                }
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="请求超时")
    except httpx.RequestError as e:
        logger.error(f"请求壁纸时发生错误: {e}")
        raise HTTPException(status_code=500, detail="网络请求失败")
    except Exception as e:
        logger.error(f"获取壁纸时发生未知错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")


@router.get("/sources")
async def get_wallpaper_sources():
    """
    获取支持的壁纸源列表
    """
    return {
        "sources": [
            {
                "id": "unsplash",
                "name": "Unsplash",
                "description": "高质量摄影作品",
                "categories": WALLPAPER_SOURCES["unsplash"]["categories"],
                "supports_category": True,
                "supports_blur": False
            },
            {
                "id": "picsum",
                "name": "Lorem Picsum",
                "description": "随机精美图片",
                "categories": [],
                "supports_category": False,
                "supports_blur": True
            },
            {
                "id": "bing",
                "name": "必应每日壁纸",
                "description": "微软必应每日精选",
                "categories": [],
                "supports_category": False,
                "supports_blur": False
            }
        ]
    }


@router.get("/bing/daily")
async def get_bing_daily_wallpaper():
    """
    获取必应每日壁纸信息
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 获取必应壁纸API信息
            response = await client.get("https://api.dujin.org/bing/m.php")
            
            if response.status_code == 200:
                return {
                    "url": response.text.strip(),
                    "date": "today",
                    "source": "bing"
                }
            else:
                raise HTTPException(status_code=500, detail="获取必应壁纸信息失败")
                
    except Exception as e:
        logger.error(f"获取必应壁纸信息时发生错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")


@router.get("/bing/history")
async def get_bing_history_wallpaper(days_ago: int = Query(0, description="获取几天前的壁纸，0为今天，最大30天")):
    """
    获取必应历史壁纸
    """
    try:
        if days_ago < 0 or days_ago > 30:
            raise HTTPException(status_code=400, detail="days_ago参数必须在0-30之间")
        
        # 使用必应官方API获取历史壁纸
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 必应官方壁纸API
            api_url = f"https://www.bing.com/HPImageArchive.aspx?format=js&idx={days_ago}&n=1&mkt=zh-CN"
            response = await client.get(api_url)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("images") and len(data["images"]) > 0:
                    image_info = data["images"][0]
                    base_url = "https://www.bing.com"
                    image_url = base_url + image_info["url"]
                    
                    return {
                        "url": image_url,
                        "title": image_info.get("title", ""),
                        "copyright": image_info.get("copyright", ""),
                        "date": image_info.get("startdate", ""),
                        "source": "bing_official"
                    }
                else:
                    raise HTTPException(status_code=404, detail="未找到壁纸数据")
            else:
                raise HTTPException(status_code=500, detail="获取必应壁纸失败")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取必应历史壁纸时发生错误: {e}")
        raise HTTPException(status_code=500, detail="服务器内部错误")


def _build_wallpaper_url(source: str, width: int, height: int, category: Optional[str], blur: Optional[int]) -> str:
    """
    根据参数构建壁纸URL
    """
    if source not in WALLPAPER_SOURCES:
        raise HTTPException(status_code=400, detail=f"不支持的壁纸源: {source}")
    
    config = WALLPAPER_SOURCES[source]
    
    if source == "unsplash":
        url = f"{config['base_url']}/{width}x{height}"
        if category and category in config["categories"]:
            url += f"/?{category}"
        else:
            url += "/?nature,landscape"
        return url
        
    elif source == "picsum":
        url = f"{config['base_url']}/{width}/{height}"
        params = []
        if blur and 1 <= blur <= 10:
            params.append(f"blur={blur}")
        params.append(f"random={asyncio.get_event_loop().time()}")
        if params:
            url += "?" + "&".join(params)
        return url
        
    elif source == "bing":
        # 必应壁纸 - 这个分支现在不会被调用，因为在random端点中直接处理
        # 保留作为备用
        return f"{config['base_url']}/1920.php"
    
    else:
        raise HTTPException(status_code=400, detail=f"不支持的壁纸源: {source}")


async def _iter_content(content: bytes):
    """
    异步迭代器，用于流式传输图片内容
    """
    chunk_size = 8192
    for i in range(0, len(content), chunk_size):
        yield content[i:i + chunk_size] 