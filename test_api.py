#!/usr/bin/env python3
"""
测试壁纸API的简单脚本
"""
import requests
import json

def test_wallpaper_sources():
    """测试获取壁纸源列表"""
    print("测试获取壁纸源列表...")
    try:
        response = requests.get("http://localhost:8000/api/wallpaper/sources")
        if response.status_code == 200:
            data = response.json()
            print("✅ 壁纸源列表获取成功:")
            for source in data['sources']:
                print(f"  - {source['name']}: {source['description']}")
        else:
            print(f"❌ 获取失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

def test_wallpaper_random():
    """测试获取随机壁纸"""
    print("\n测试获取随机壁纸...")
    sources = ['unsplash', 'picsum', 'bing']
    
    for source in sources:
        print(f"\n测试 {source} 源:")
        try:
            url = f"http://localhost:8000/api/wallpaper/random?source={source}&width=800&height=600"
            response = requests.head(url, timeout=10)  # 使用HEAD请求避免下载整个图片
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', 'unknown')
                print(f"  ✅ {source} 壁纸获取成功 (类型: {content_type})")
            else:
                print(f"  ❌ {source} 壁纸获取失败: {response.status_code}")
        except Exception as e:
            print(f"  ❌ {source} 请求失败: {e}")

def test_bing_daily():
    """测试必应每日壁纸信息"""
    print("\n测试必应每日壁纸信息...")
    try:
        response = requests.get("http://localhost:8000/api/wallpaper/bing/daily")
        if response.status_code == 200:
            data = response.json()
            print("✅ 必应每日壁纸信息获取成功:")
            print(f"  URL: {data.get('url', 'N/A')}")
            print(f"  日期: {data.get('date', 'N/A')}")
        else:
            print(f"❌ 获取失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    print("🧪 开始测试壁纸API...")
    print("=" * 50)
    
    test_wallpaper_sources()
    test_wallpaper_random()
    test_bing_daily()
    
    print("\n" + "=" * 50)
    print("🎉 测试完成！")
    print("\n💡 提示:")
    print("- 如果所有测试都通过，说明后端API工作正常")
    print("- 现在可以在浏览器中访问 http://localhost:8000 测试前端功能")
    print("- 按 W 键或点击壁纸按钮来切换壁纸") 