# 壁纸API 422错误修复说明

## 问题描述

部署后访问壁纸API时出现422错误：
```
GET https://search.yxhpy.top/api/wallpaper/random?source=bing&width=2520&height=1681.25&t=1748576979615 422 (Unprocessable Content)
```

## 问题分析

1. **根本原因**: FastAPI的参数验证期望`width`和`height`为整数类型，但前端传递了浮点数`1681.25`
2. **触发条件**: 当设备像素比不是整数时，`window.screen.width * devicePixelRatio`可能产生浮点数
3. **影响范围**: 所有使用壁纸功能的用户，特别是高DPI显示器用户

## 修复方案

### 后端修复 (`app/routers/wallpaper.py`)

1. **参数类型调整**:
   ```python
   # 修改前
   width: int = Query(1920, description="图片宽度"),
   height: int = Query(1080, description="图片高度"),
   
   # 修改后
   width: float = Query(1920, description="图片宽度"),
   height: float = Query(1080, description="图片高度"),
   ```

2. **内部类型转换**:
   ```python
   # 将浮点数转换为整数，避免参数验证错误
   width = int(round(width))
   height = int(round(height))
   ```

3. **参数范围验证**:
   ```python
   # 验证参数范围
   if width <= 0 or height <= 0:
       raise HTTPException(status_code=400, detail="图片尺寸必须大于0")
   if width > 10000 or height > 10000:
       raise HTTPException(status_code=400, detail="图片尺寸不能超过10000像素")
   ```

### 前端加强 (`static/js/components/WallpaperManager.js`)

1. **双重整数保证**:
   ```javascript
   // 使用Math.round确保得到整数，避免API参数验证错误
   const width = Math.round(Math.max(screenWidth, minWidth));
   const height = Math.round(Math.max(screenHeight, minHeight));
   
   // 再次确保是整数，防止任何浮点数问题
   const finalWidth = parseInt(width, 10);
   const finalHeight = parseInt(height, 10);
   ```

## 修复效果

- ✅ 解决422参数验证错误
- ✅ 支持任意设备像素比的显示器
- ✅ 保持API的健壮性和安全性
- ✅ 向后兼容现有功能

## 测试验证

修复后的API能够正确处理以下情况：
- 整数参数：`width=1920&height=1080`
- 浮点数参数：`width=2520&height=1681.25`
- 边界值：`width=1&height=1`
- 超大值：`width=9999&height=9999`

## 部署说明

1. 重新构建Docker镜像
2. 重启服务
3. 验证壁纸功能正常工作

## 相关文件

- `app/routers/wallpaper.py` - 后端API修复
- `static/js/components/WallpaperManager.js` - 前端加强
- `WALLPAPER_FEATURE.md` - 壁纸功能说明文档

## 提交信息

```
修复壁纸API 422错误：支持浮点数参数并自动转换为整数

- 修改后端API参数类型从int改为float，支持浮点数输入
- 在API内部将浮点数转换为整数，避免参数验证错误
- 增加参数范围验证，确保图片尺寸合理
- 加强前端数值处理，使用parseInt确保传递整数
- 解决部署后壁纸功能422错误问题
``` 