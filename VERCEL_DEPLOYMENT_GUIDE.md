# 🚀 MoneyFast Uganda - Vercel Deployment Guide

Bu guide ile MoneyFast Uganda projenizi **5-10 dakikada** Vercel'e deploy edip canlıya alabilirsiniz.

---

## 📋 Ön Hazırlık

### Gerekli Hesaplar

1. ✅ **GitHub Account** - Mevcut (Repository: `https://github.com/ichbrt/moneyfast-app.git`)
2. ⚠️ **Vercel Account** - Eğer yoksa [vercel.com](https://vercel.com) üzerinden GitHub ile giriş yapın
3. ⚠️ **Domain** - dslns.com (DNS ayarlarına erişiminiz olmalı)

### Opsiyonel (Production için)

- **PostgreSQL Database** - Ücretsiz seçenekler: [Neon.tech](https://neon.tech), [Supabase](https://supabase.com)
- **MTN MoMo Credentials** - [MTN Developer Portal](https://momodeveloper.mtn.com/)
- **Airtel Money Credentials** - [Airtel Developer Portal](https://developers.airtel.africa/)

---

## 🎯 Adım 1: Vercel'e Giriş Yapın

1. [https://vercel.com](https://vercel.com) adresine gidin
2. **"Sign Up"** veya **"Login"** butonuna tıklayın
3. **"Continue with GitHub"** seçeneğini seçin
4. GitHub hesabınızla giriş yapın ve Vercel'e yetki verin

---

## 🎯 Adım 2: Yeni Proje Oluşturun

1. Vercel Dashboard'da **"Add New..."** butonuna tıklayın
2. **"Project"** seçeneğini seçin
3. GitHub repository listesinde **"moneyfast-app"** repository'sini bulun
   - Eğer görmüyorsanız: **"Adjust GitHub App Permissions"** → Repository'yi ekleyin
4. **"Import"** butonuna tıklayın

---

## 🎯 Adım 3: Proje Ayarlarını Yapın

### Framework Preset
- **Framework Preset**: `Other` (varsayılan olarak seçili olabilir)

### Root Directory
- **Root Directory**: `./` (varsayılan)

### Build Settings
- **Build Command**: Boş bırakın veya `npm install`
- **Output Directory**: Boş bırakın
- **Install Command**: `npm install` (otomatik)

### Environment Variables

**ÖNEMLİ**: Aşağıdaki environment variables'ları eklemeniz gerekiyor. 

**"Environment Variables"** bölümüne tıklayın ve şu değişkenleri ekleyin:

#### Zorunlu Değişkenler (Minimum Çalışma İçin)

```
JWT_SECRET=moneyfast-uganda-super-secret-key-2025-change-this
NODE_ENV=production
PORT=3000
MOCK_MODE=true
```

> **Not**: `MOCK_MODE=true` ile başlayın. Bu demo mode'dur ve gerçek API çağrıları yapmaz. Production'a geçince `false` yapacaksınız.

#### MTN MoMo Credentials (Sandbox - Opsiyonel)

Eğer MTN test credentials'larınız varsa:

```
MTN_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_SUBSCRIPTION_KEY=your_mtn_subscription_key_here
MTN_API_USER=your_mtn_api_user_uuid_here
MTN_API_KEY=your_mtn_api_key_here
MTN_TARGET_ENVIRONMENT=sandbox
MTN_CALLBACK_HOST=https://your-vercel-url.vercel.app
```

> **Not**: Şimdilik boş bırakabilirsiniz. `MOCK_MODE=true` olduğu için gerekli değil.

#### Airtel Money Credentials (Sandbox - Opsiyonel)

Eğer Airtel test credentials'larınız varsa:

```
AIRTEL_BASE_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_airtel_client_id_here
AIRTEL_CLIENT_SECRET=your_airtel_client_secret_here
```

> **Not**: Şimdilik boş bırakabilirsiniz. `MOCK_MODE=true` olduğu için gerekli değil.

#### Database (Opsiyonel - Production İçin)

Şimdilik **GEREKLİ DEĞİL**. Demo mode SQLite kullanır.

Production için PostgreSQL kullanacaksanız:

```
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

---

## 🎯 Adım 4: Deploy Edin!

1. Tüm ayarları yaptıktan sonra **"Deploy"** butonuna tıklayın
2. Vercel build işlemini başlatacak (1-3 dakika sürer)
3. Build tamamlandığında **"Congratulations!"** mesajı göreceksiniz
4. Size bir URL verilecek: `https://moneyfast-app-xxx.vercel.app`

---

## 🎯 Adım 5: Test Edin

Deploy tamamlandıktan sonra:

### Landing Page Test
1. Vercel'in verdiği URL'i açın: `https://moneyfast-app-xxx.vercel.app/`
2. MoneyFast Uganda landing page'i görmelisiniz
3. Logo, görseller ve navigation çalışıyor mu kontrol edin

### Login Test
1. `https://moneyfast-app-xxx.vercel.app/login.html` adresine gidin
2. Default credentials ile giriş yapın:
   - **Email**: `admin@smsconstruction.com`
   - **Password**: `admin123`
3. Başarılı giriş sonrası dashboard'a yönlendirilmelisiniz

### Dashboard Test
1. Dashboard'da batch listesini görebiliyor musunuz?
2. **"Upload CSV"** butonuna tıklayın
3. Upload sayfası açılıyor mu kontrol edin

---

## 🎯 Adım 6: Domain Bağlayın (dslns.com)

### Vercel'de Domain Ekleyin

1. Vercel Dashboard'da projenize gidin
2. **"Settings"** → **"Domains"** sekmesine tıklayın
3. `dslns.com` yazıp **"Add"** butonuna tıklayın
4. Vercel size DNS kayıtları gösterecek

### DNS Kayıtlarını Güncelleyin

Vercel iki seçenek sunacak:

**Seçenek A: A Record (Önerilen)**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel'in IP'si)
```

**Seçenek B: CNAME**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

1. Domain sağlayıcınızın paneline gidin (dslns.com'u aldığınız yer)
2. DNS ayarlarına gidin
3. Vercel'in gösterdiği kayıtları ekleyin
4. Kaydedin ve 5-30 dakika bekleyin (DNS propagation)

### Domain Doğrulama

1. DNS propagation tamamlandıktan sonra Vercel otomatik doğrulayacak
2. `https://dslns.com` adresinde siteniz yayında olacak!

---

## ✅ Deployment Başarılı!

Tebrikler! MoneyFast Uganda artık canlıda! 🎉

### Erişim URL'leri

- **Landing Page**: `https://dslns.com/` (domain bağlandıktan sonra)
- **Login**: `https://dslns.com/login.html`
- **Dashboard**: `https://dslns.com/dashboard.html`

### Default Login Credentials

- **Email**: `admin@smsconstruction.com`
- **Password**: `admin123`

> ⚠️ **GÜVENLİK UYARISI**: Production'a geçmeden önce mutlaka şifreyi değiştirin!

---

## 🔧 Sonraki Adımlar (Production Hazırlığı)

### 1. Default Password Değiştirin

```bash
cd d:\Projeler\AntiGravityProjects\moneyfast-app
node update-password.js
```

Yeni şifreyi girin ve Vercel'de environment variables'a ekleyin.

### 2. PostgreSQL Database Kurun

1. [Neon.tech](https://neon.tech) veya [Supabase](https://supabase.com)'e gidin
2. Ücretsiz PostgreSQL database oluşturun
3. Connection string'i alın
4. Vercel'de `DATABASE_URL` environment variable'ını ekleyin
5. `MOCK_MODE=false` yapın

### 3. Production API Credentials Alın

#### MTN MoMo Production
1. [MTN Developer Portal](https://momodeveloper.mtn.com/) → Production subscription
2. Credentials'ları Vercel environment variables'a ekleyin
3. `MTN_TARGET_ENVIRONMENT=production` yapın

#### Airtel Money Production
1. [Airtel Developer Portal](https://developers.airtel.africa/) → Production app
2. Credentials'ları Vercel environment variables'a ekleyin

### 4. Security Checklist

- [ ] Default password değiştirildi
- [ ] `JWT_SECRET` güçlü bir key ile değiştirildi
- [ ] `MOCK_MODE=false` yapıldı
- [ ] Production database bağlandı
- [ ] Production API credentials eklendi
- [ ] HTTPS aktif (Vercel otomatik sağlar)

---

## 🆘 Sorun Giderme

### Build Hatası

**Hata**: `npm install` başarısız
- **Çözüm**: `package.json` dosyasını kontrol edin, dependencies doğru mu?

### 404 Hatası

**Hata**: Tüm sayfalar 404 döndürüyor
- **Çözüm**: `vercel.json` dosyası doğru yapılandırılmış mı kontrol edin

### Login Çalışmıyor

**Hata**: Login sonrası hata alıyorum
- **Çözüm**: `JWT_SECRET` environment variable'ı eklenmiş mi kontrol edin

### Database Hatası

**Hata**: Database connection error
- **Çözüm**: `MOCK_MODE=true` yapın veya `DATABASE_URL` doğru mu kontrol edin

---

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. **Vercel Logs**: Dashboard → Deployments → Son deployment → Logs
2. **GitHub Issues**: Repository'de issue açın
3. **Email**: beratdemirci@spacebera.com

---

**Hazırlayan**: SpaceBera  
**Tarih**: 2025-12-09  
**Versiyon**: 1.0
