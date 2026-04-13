@echo off
chcp 65001 >nul
echo ----------------------------------------------------
echo         ĐẨY CODE MỚI LÊN GITHUB & RENDER
echo ----------------------------------------------------

echo [1/3] Đang lấy tất cả file vừa thay đổi...
git add .

echo.
set /p message="[2/3] Nhập ghi chú commit (Nhấn Enter để dùng mặc định 'Cập nhật nội dung'): "
if "%message%"=="" set message=Cập nhật nội dung

git commit -m "%message%"

echo.
echo [3/3] Đang đẩy code lên Github...
git push

echo.
echo ====================================================
echo HOÀN TẤT THÀNH CÔNG!
echo Code đã nằm trên Github. Render.com sẽ bắt đầu build tự động.
echo Bạn vui lòng chờ khoảng 2-3 phút trước khi gọi lại API trên n8n nhé!
echo ====================================================
pause
