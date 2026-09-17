@echo off
echo ========================================
echo   আমার সৃতি - দৈনন্দিন কাজের হিসাব
echo ========================================
echo.

echo [1/2] Backend ইনস্টল করছে...
cd server
call npm install
echo.

echo [2/2] Frontend ইনস্টল করছে...
cd ..\client
call npm install
echo.

echo ========================================
echo   সব ইনস্টল সম্পন্ন!
echo ========================================
echo.
echo এখন সার্ভার চালু করতে:
echo   cd server && npm start
echo.
echo এবং ব্রাউজারে খুলুন:
echo   http://localhost:3000
echo.
pause
