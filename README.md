# 💈 Barber-Dashboard

**Barber-Dashboard**, berberler ve müşteriler için geliştirilmiş modern, rol bazlı bir **randevu yönetim sistemi**dir.  
Kullanıcılar saniyeler içinde randevu alabilirken, berberler günlük operasyonlarını sade ve hızlı bir arayüzle yönetebilir.

> Hizmet seç → Saat seç → Onayla  
> Mobil uyumlu • Light/Dark tema • Gerçek hayat senaryosu

---

## 📁 Repo Yapısı

```txt
Barber-Dashboard/
├─ barberbook/     # Frontend (React + Vite)

├─ backend/        # Backend (Node.js + Express + Prisma)

└─ README.md
```

🚀 Özellikler
👤 Kullanıcı (Customer)

Uygun saatleri görüntüleme

Randevu oluşturma

Yaklaşan randevuyu görüntüleme

Randevu iptali

Son randevular listesi

Mobil uyumlu ve hızlı akış

💇‍♂️ Berber (Barber)

Günlük randevu listesi

Aktif / sıradaki müşteri takibi

Randevu durum güncelleme
(PENDING, CONFIRMED, DONE, CANCELLED)

Operasyon odaklı dashboard (gelir değil süreç)

Rol bazlı yetkilendirme

🌐 Genel

Guest kullanıcılar için landing page

Light / Dark tema (shadcn/ui)

Responsive (mobile-first) tasarım

JWT tabanlı authentication

Token doğrulama (/auth/me)

401 yakalama & otomatik logout

Temiz API – UI ayrımı


## 🖼️ Ekran Görüntüleri

![Berber Dashboard](./barberbook/public/screenshots/barber-dashboard.png)
![Misafir Anasayfa](./barberbook/public/screenshots/guest-home.png)
![Kullanıcı Anasayfa](./barberbook/public/screenshots/user-home.png)
![Randevu Al](./barberbook/public/screenshots/book.png)
![Giriş Yapma Ekranı](./barberbook/public/screenshots/loginPage.png)
![Prisma DB](./barberbook/public/screenshots/prismaDB.png)



🧱 Teknoloji Stack’i

Frontend

React + TypeScript

Vite

React Router

Axios

Tailwind CSS

shadcn/ui

Lucide Icons

Backend

Node.js

Express

Prisma ORM

PostgreSQL / SQLite

JWT Authentication

Diğer

Role-based routing

Centralized API layer

Responsive & accessible UI

🧠 Mimari Yaklaşım

AuthContext ile global auth yönetimi

Token → /auth/me ile doğrulama

ProtectedRoute & RoleRoute

API servisleri UI’dan ayrıldı

UI state ↔ backend state senkron

⚙️ Kurulum
# Frontend
git clone https://github.com/USERNAME/barberbook.git
cd barberbook
npm install
npm run dev

# Backend
```txt
cd backend
npm install
npx prisma migrate dev
npm run dev
``` 

# .env örneği:
```txt
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
PORT=your_port
```
🎯 Projenin Amacı

Bu proje;
gerçek hayattaki bir ihtiyacı çözmek,
React + Backend entegrasyonunu uçtan uca göstermek,
rol bazlı UI/UX tasarımı sergilemek
amacıyla geliştirilmiştir.

Tamamen portfolio ve öğrenme odaklıdır, ancak gerçek bir SaaS mimarisine yakındır.

