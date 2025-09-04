# 🚀 Movie Explorer - Deployment Guide

## PWA Features
- ✅ Service Worker for offline caching
- ✅ Web App Manifest for installability  
- ✅ TMDB images cached (7 days, freshness strategy)
- ✅ OMDb API cached (1 day, performance strategy)
- ✅ App shell prefetched for instant loading

## Local PWA Testing

```bash
# Build production version
ng build --configuration=production

# Serve with http-server
npx http-server -p 8080 ./dist/movie-explorer/browser

# Open http://localhost:8080
# Check DevTools → Application → Service Workers
```

## Deployment Options

### Option A: Netlify
1. Push to Git repository
2. Connect repo to Netlify
3. Build settings auto-detected from `netlify.toml`:
   - Build command: `ng build --configuration=production`
   - Publish directory: `dist/movie-explorer/browser`
   - Redirects: SPA routing configured

### Option B: Vercel  
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Settings auto-detected from `vercel.json`
4. Or connect Git repo via Vercel dashboard

### Option C: Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
   - Use existing `firebase.json` configuration
4. Deploy: `firebase deploy`

## PWA Checklist ✅
- [x] Service Worker registers successfully
- [x] Manifest.json with proper app metadata
- [x] Icons for all device sizes (72x72 to 512x512)
- [x] Offline functionality for visited pages
- [x] TMDB images cached for offline viewing
- [x] Installable on mobile devices
- [x] SPA routing works on all platforms

## Performance Optimizations
- **Asset Caching**: Static files cached with 1-year expiry
- **Service Worker**: No-cache headers prevent stale SW
- **Image Caching**: TMDB posters cached for 7 days
- **API Caching**: OMDb responses cached for 1 day
- **Bundle Size**: < 400KB initial bundle

## Testing PWA Features
1. **Service Worker**: DevTools → Application → Service Workers
2. **Manifest**: DevTools → Application → Manifest  
3. **Install**: Chrome menu → "Install Movie Explorer"
4. **Offline**: Disable network → reload page
5. **Lighthouse**: Run PWA audit for score

## Environment Variables
All API keys are in frontend code. For production:
- Set TMDB API key restrictions by domain
- Set OMDb API key restrictions by referrer
- Consider backend proxy for sensitive keys

## Cache Strategies
- **App Shell**: Prefetch for instant loading
- **TMDB Images**: Network-first (freshness) with 7-day cache
- **OMDb API**: Cache-first (performance) with 1-day cache
- **Static Assets**: Cache-first with 1-year expiry

-----------------------------------
ได้เลยค่ะ 🙌 ฉันจะแปลเป็นภาษาไทยให้ครบถ้วนและคงรูปแบบ Markdown เดิม

---

# 🚀 Movie Explorer - คู่มือการ Deploy

## ฟีเจอร์ PWA

* ✅ Service Worker สำหรับการ cache แบบออฟไลน์
* ✅ Web App Manifest สำหรับการติดตั้งเป็นแอป
* ✅ Cache รูปภาพ TMDB (7 วัน, กลยุทธ์ freshness)
* ✅ Cache OMDb API (1 วัน, กลยุทธ์ performance)
* ✅ Prefetch app shell เพื่อการโหลดที่รวดเร็วทันที

## การทดสอบ PWA แบบ Local

```bash
# สร้าง production build
ng build --configuration=production

# รันด้วย http-server
npx http-server -p 8080 ./dist/movie-explorer/browser

# เปิด http://localhost:8080
# ตรวจสอบ DevTools → Application → Service Workers
```

## ตัวเลือกการ Deploy

### ตัวเลือก A: Netlify

1. push โค้ดไปที่ Git repository
2. เชื่อม repo กับ Netlify
3. การตั้งค่า build ถูกตรวจอัตโนมัติจาก `netlify.toml`:

   * คำสั่ง build: `ng build --configuration=production`
   * โฟลเดอร์เผยแพร่: `dist/movie-explorer/browser`
   * Redirects: ตั้งค่า SPA routing เรียบร้อย

### ตัวเลือก B: Vercel

1. ติดตั้ง Vercel CLI: `npm i -g vercel`
2. รัน `vercel` ที่ project root
3. การตั้งค่าจะถูกตรวจอัตโนมัติจาก `vercel.json`
4. หรือเชื่อม repo ผ่าน Vercel dashboard

### ตัวเลือก C: Firebase Hosting

1. ติดตั้ง Firebase CLI: `npm i -g firebase-tools`
2. Login: `firebase login`
3. Initial: `firebase init hosting`

   * ใช้ค่า config ที่มีอยู่ใน `firebase.json`
4. Deploy: `firebase deploy`

## รายการตรวจสอบ PWA ✅

* [x] Service Worker ลงทะเบียนสำเร็จ
* [x] มี Manifest.json พร้อม metadata ของแอปครบถ้วน
* [x] มีไอคอนทุกขนาดอุปกรณ์ (72x72 ถึง 512x512)
* [x] ใช้งานออฟไลน์ได้สำหรับหน้าที่เคยเข้าชม
* [x] Cache รูปภาพ TMDB สำหรับใช้งานออฟไลน์
* [x] ติดตั้งลงมือถือได้
* [x] SPA routing ใช้งานได้ในทุกแพลตฟอร์ม

## การปรับประสิทธิภาพ

* **Asset Caching**: ไฟล์ static ถูก cache ไว้ 1 ปี
* **Service Worker**: ใช้ no-cache headers เพื่อกัน SW เก่าค้าง
* **Image Caching**: โปสเตอร์ TMDB cache 7 วัน
* **API Caching**: คำตอบจาก OMDb cache 1 วัน
* **Bundle Size**: ขนาดไฟล์เริ่มต้น < 400KB

## การทดสอบฟีเจอร์ PWA

1. **Service Worker**: DevTools → Application → Service Workers
2. **Manifest**: DevTools → Application → Manifest
3. **Install**: เมนู Chrome → "Install Movie Explorer"
4. **Offline**: ปิด network → reload หน้า
5. **Lighthouse**: รัน PWA audit เพื่อดูคะแนน

## ตัวแปร Environment

API key ทั้งหมดอยู่ใน frontend code สำหรับ production:

* ตั้งค่า restriction ของ TMDB API key ตาม domain
* ตั้งค่า restriction ของ OMDb API key ตาม referrer
* พิจารณาทำ backend proxy สำหรับ key ที่อ่อนไหว

## กลยุทธ์ Cache

* **App Shell**: Prefetch เพื่อโหลดทันที
* **TMDB Images**: Network-first (freshness) cache 7 วัน
* **OMDb API**: Cache-first (performance) cache 1 วัน
* **Static Assets**: Cache-first 1 ปี

---

คุณอยากให้ฉันช่วยเขียน **netlify.toml** หรือ **vercel.json** ตัวอย่างไฟล์จริง ๆ ให้เลยมั้ยคะ จะได้ copy ไปใช้ตรง ๆ ได้เลย 🚀
