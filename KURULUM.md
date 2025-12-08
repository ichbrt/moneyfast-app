# Bulk Payment System - Kurulum ve Kullanım

## 📋 Gereksinimler

Sistemin çalışabilmesi için şu yazılımlara ihtiyacınız var:
- **Node.js** 14 veya üzeri
- **PostgreSQL** 12 veya üzeri
- **npm** (Node.js ile birlikte gelir)

## 🚀 Hızlı Başlangıç

### 1. Veritabanı Kurulumu

PostgreSQL'de yeni bir veritabanı oluşturun:

```bash
# PostgreSQL'e bağlanın
psql -U postgres

# Veritabanını oluşturun
CREATE DATABASE bulk_payments;

# Çıkış yapın
\q
```

Veritabanı şemasını yükleyin:

```bash
psql -U postgres -d bulk_payments -f sql/schema.sql
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

`.env` dosyasını açın ve şu değerleri güncelleyin:

```env
# Veritabanı
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bulk_payments

# JWT Secret (güçlü bir şifre kullanın)
JWT_SECRET=your-very-secure-random-secret-key-here
```

### 3. Paketleri Kurun

```bash
npm install
```

### 4. Sunucuyu Başlatın

Geliştirme modu (otomatik yeniden başlatma ile):
```bash
npm run dev
```

Veya normal mod:
```bash
npm start
```

### 5. Uygulamaya Erişin

Tarayıcınızda açın:
- **Web Arayüzü**: http://localhost:3000
- **API**: http://localhost:3000/api

**Varsayılan Giriş Bilgileri:**
- E-posta: `admin@smsconstruction.com`
- Şifre: `admin123`

⚠️ **ÖNEMLİ**: Üretim ortamında bu şifreyi mutlaka değiştirin!

## 📱 MTN ve Airtel API Ayarları

### MTN MoMo Sandbox

1. https://momodeveloper.mtn.com/ adresine gidin
2. Kayıt olun ve **Disbursements** ürününe abone olun
3. API User ve API Key oluşturun
4. Subscription Key'inizi alın
5. `.env` dosyasına ekleyin:

```env
MTN_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_SUBSCRIPTION_KEY=your_subscription_key
MTN_API_USER=your_api_user_uuid
MTN_API_KEY=your_api_key
MTN_TARGET_ENVIRONMENT=sandbox
```

### Airtel Money Sandbox

1. https://developers.airtel.africa/ adresine gidin
2. Kayıt olun ve bir uygulama oluşturun
3. **Disbursements** ürününü seçin
4. Client ID ve Client Secret'ı alın
5. `.env` dosyasına ekleyin:

```env
AIRTEL_BASE_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_client_id
AIRTEL_CLIENT_SECRET=your_client_secret
```

## 📊 CSV Formatı

CSV dosyanız şu formatta olmalı:

```csv
phone_number,amount,reference,description
0772123456,450000,DEC-2025-001,Site foreman salary
0783987654,1200000,DEC-2025-002,Engineer salary
0751234567,800000,DEC-2025-003,Store keeper salary
0709988776,950000,DEC-2025-004,HSE officer salary
```

**Önemli Notlar:**
- Telefon numaraları 07 ile başlamalı (Uganda formatı)
- Tutar tam sayı olmalı (küsurat yok)
- Başlık satırı gerekli

## 🔧 Kullanım

### Web Arayüzü İle

1. **Giriş Yapın**: http://localhost:3000
2. **Yeni Batch Oluştur** butonuna tıklayın
3. Batch referansı girin (örn: "Aralık 2025 Maaşları")
4. CSV dosyanızı yükleyin
5. Batch oluşturulduktan sonra otomatik olarak işleme alınır

### API İle (C# ERP Entegrasyonu)

```csharp
// C# örnek kod
var client = new HttpClient();
client.BaseAddress = new Uri("http://localhost:3000");

// Login
var loginData = new { email = "admin@smsconstruction.com", password = "admin123" };
var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginData);
var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
string token = loginResult.token;

// Batch oluştur
client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
var batchData = new {
    reference = "Aralık 2025 Maaş",
    items = new[] {
        new { phone_number = "0772123456", amount = 450000 },
        new { phone_number = "0751234567", amount = 800000 }
    }
};
var batchResponse = await client.PostAsJsonAsync("/api/batches", batchData);
var batchResult = await batchResponse.Content.ReadFromJsonAsync<BatchResponse>();

Console.WriteLine($"Batch ID: {batchResult.batch.batchId}");
```

## 🔄 Payout Worker

Ödeme işlemleri otomatik olarak işlenir. Manuel olarak tetiklemek için:

```bash
curl -X POST http://localhost:3000/api/cron/run-payouts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Veya cron job ile otomatik çalıştırın (her dakika):
```bash
* * * * * curl -X POST http://localhost:3000/api/cron/run-payouts -H "Authorization: Bearer TOKEN"
```

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası
- `DATABASE_URL`'in `.env` dosyasında doğru olduğundan emin olun
- PostgreSQL'in çalıştığını kontrol edin: `pg_isready`
- Şifre ve kullanıcı adını doğrulayın

### Login Yapamıyorum
- Varsayılan şifre: `admin123`
- `JWT_SECRET` ayarlandığından emin olun
- Veritabanında kullanıcı kaydı olduğunu kontrol edin

### MTN/Airtel API Hataları
- Sandbox credential'larınızı kontrol edin
- API URL'lerinin doğru olduğundan emin olun
- Console loglarını inceleyin

## 📚 Proje Yapısı

```
bulk-payment-system/
├── src/              # Backend kaynak kodları
│   ├── config/       # Veritabanı ayarları
│   ├── models/       # Veritabanı modelleri
│   ├── providers/    # MTN/Airtel API entegrasyonları
│   ├── services/     # İş mantığı servisleri
│   ├── routes/       # API endpoint'leri
│   └── middlewares/  # Kimlik doğrulama vb.
├── public/           # Frontend dosyaları
│   ├── css/          # Stiller
│   ├── js/           # JavaScript
│   └── *.html        # Sayfalar
├── sql/              # Veritabanı şeması
└── .env              # Ortam değişkenleri
```

## 🔐 Güvenlik

Üretim ortamı için:
1. Güçlü `JWT_SECRET` kullanın
2. PostgreSQL SSL bağlantısı etkinleştirin
3. HTTPS kullanın (Nginx + Let's Encrypt)
4. IP whitelist uygulayın
5. Rate limiting ekleyin

## 📞 Destek

Sorularınız için SMS Construction IT departmanı ile iletişime geçin.
