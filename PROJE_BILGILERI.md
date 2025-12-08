# 🚀 MoneyFast Uganda - Proje Bilgileri

## 📍 Proje Konumu
```
C:\Users\Berat Demirci\.gemini\antigravity\scratch\moneyfast-uganda
```

## 🔄 Projeye Geri Dönme

### Yöntem 1: VS Code ile
1. VS Code'u açın
2. **File → Open Folder**
3. Şu klasörü seçin: `C:\Users\Berat Demirci\.gemini\antigravity\scratch\bulk-payment-system`

### Yöntem 2: Terminal ile
```powershell
cd "C:\Users\Berat Demirci\.gemini\antigravity\scratch\bulk-payment-system"
code .
```

## 🖥️ Sunucuyu Başlatma

Proje klasöründe terminal açıp şunu çalıştırın:
```bash
npm run dev
```

Sunucu başladıktan sonra:
- Tarayıcıda açın: **http://localhost:3000**
- Giriş: `admin@smsconstruction.com` / `admin123`

## 📁 Önemli Dosyalar

- **`README.md`** - Genel dokümantasyon
- **`TEST_REHBERI.md`** - Test kılavuzu (Türkçe)
- **`SISTEM_OZETI.md`** - Sistem özeti (Türkçe)
- **`KULLANIM_KILAVUZU.md`** - Kullanım kılavuzu (Türkçe)
- **`.env.example`** - Ortam değişkenleri örneği

## 🔧 Hızlı Komutlar

```bash
# Sunucuyu başlat
npm run dev

# Database kurulumu (ilk kurulumda)
npm run db:setup

# Test çalıştır
npm test
```

## 🎨 Logo & Branding

- **Marka Adı**: MoneyFast Uganda
- **Logo**: `public/assets/logo.png`
- **Renk Paleti**: Yeşil-Turkuaz gradient
- **Tagline**: "Uganda Mobile Money Automation"

## 🔐 Demo Hesaplar

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@smsconstruction.com | admin123 | ADMIN |

## 📊 Proje Yapısı

```
bulk-payment-system/
├── public/              # Frontend dosyaları
│   ├── assets/         # Logo ve görseller
│   ├── css/           # Stil dosyaları
│   ├── js/            # JavaScript dosyaları
│   ├── index.html     # Login sayfası
│   ├── dashboard.html # Dashboard
│   ├── upload.html    # Dosya yükleme
│   └── batch-details.html
├── src/                # Backend kaynak kodları
│   ├── routes/        # API rotaları
│   ├── services/      # İş mantığı
│   ├── models/        # Veritabanı modelleri
│   ├── providers/     # MTN/Airtel entegrasyonları
│   └── utils/         # Yardımcı fonksiyonlar
├── .env               # Ortam değişkenleri (oluşturmanız gerekli)
└── package.json       # Proje bağımlılıkları
```

## 🐛 Sorun Giderme

### Sayfa Açılmıyorsa
1. Sunucunun çalıştığından emin olun: `npm run dev`
2. Terminal'de hata var mı kontrol edin
3. `http://localhost:3000` adresini tekrar deneyin
4. Tarayıcı önbelleğini temizleyin (CTRL + F5)

### Database Hatası
```bash
npm run db:setup
```

### Port 3000 Meşgul
`.env` dosyasında `PORT=3001` olarak değiştirin

## 💡 Önemli Notlar

- **Mock Mode Aktif**: `.env` dosyasında `MOCK_MODE=true` ayarlanmış
- Gerçek para gitmiyor, güvenle test edebilirsiniz
- Worker her 60 saniyede bir otomatik çalışıyor
- Excel ve CSV dosyalarını destekliyor

## 📞 Destek

Bu projeyi **Antigravity AI** ile geliştirdiniz.
Aynı konuşmaya dönmek için workspace'i açıp projeyi yükleyin.

---

**Son Güncelleme**: 8 Aralık 2025
**Versiyon**: 1.0.0
**Durum**: ✅ Üretime Hazır
